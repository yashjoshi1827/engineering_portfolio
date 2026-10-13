import {createClient} from './vendor/supabase.js';
import {cloudConfig} from './cloud-config.js';
import {stores,cleanRecord,acknowledge,mergeRemote} from './sync-core.js';
export const configured=Boolean(cloudConfig.url&&cloudConfig.key);
export const client=configured?createClient(cloudConfig.url,cloudConfig.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}):null;
const BUCKET='portfolio-private';
export const MAX_FILE=45*1024*1024;
export async function ownerSession(){
 if(!client)return null;
 if(!navigator.onLine){try{return JSON.parse(localStorage.getItem('yash-verified-owner')||'null');}catch{return null;}}
 const {data,error}=await client.auth.getSession();if(error)throw error;
 if(!data.session){localStorage.removeItem('yash-verified-owner');return null;}
 const user=data.session.user;
 if(navigator.onLine){
   const check=await client.rpc('is_portfolio_owner');if(check.error)throw check.error;
   if(check.data!==true){await client.auth.signOut({scope:'local'});throw new Error('This account is not the portfolio owner.');}
   localStorage.setItem('yash-verified-owner',JSON.stringify({id:user.id,email:user.email}));
 }
 return user;
}
export async function login(email,password){
 if(!client)throw new Error('Cloud setup is not configured yet.');
 const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;
 return ownerSession();
}
export async function logout(){
 localStorage.removeItem('yash-verified-owner');
 const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;
}
export async function publicContent(){
 if(!client)return null;
 const output={logs:[],notes:[],announcements:[]};let offset=0;
 while(true){const {data,error}=await client.from('portfolio_public').select('*').order('id').range(offset,offset+499);if(error)throw error;
 for(const row of data)output[row.kind]?.push({id:row.id,published:row.snapshot,updated:row.updated_at});
 if(data.length<500)break;offset+=500;}
 return output;
}
export async function fetchBlob(file){
 const {data,error}=await client.storage.from(BUCKET).download(file.cloudPath);if(error)throw error;return data;
}
export async function syncCloud({user,read,settle,notify}){
 if(!client||!user)throw new Error('Sign in to sync.');
 if(!navigator.onLine)throw new Error('Offline. Your changes remain queued on this device.');
 let failures=0;
 for(const store of stores){
  for(const original of await read(store)){
   if(!original._dirty||original._conflict)continue;
   let record={...original};
   try{
    if(store==='files'&&!record._deleted&&!record.cloudPath){
     const entry=await read('blobs',record.id);if(!entry?.blob)throw new Error('Original file is missing on this device.');
     if(entry.blob.size>MAX_FILE)throw new Error('File exceeds the 45 MB upload limit. Download and compress it, then add the smaller copy.');
     notify('Uploading '+record.name+'… Keep the app open.');
     record.cloudPath=user.id+'/'+record.id;
     const {error}=await client.storage.from(BUCKET).upload(record.cloudPath,entry.blob,{contentType:record.type,upsert:true});if(error)throw error;
     await settle(store,record.id,current=>({...current,cloudPath:record.cloudPath}));
    }
    const {data,error}=await client.rpc('save_portfolio_record',{p_id:record.id,p_kind:store,p_payload:cleanRecord(record),p_revision:record._revision||0,p_deleted:!!record._deleted,p_operation:record._operation});
    if(error)throw error;
    await settle(store,record.id,current=>acknowledge(current,record,data));
    if(!data.ok){failures++;continue;}
   }catch(error){failures++;await settle(store,record.id,current=>({...current,_syncError:error.message||'Upload failed. Try again.'}));}
  }
 }
 // Read every page, including tombstones so deletes propagate to other devices.
 let offset=0;
 while(true){
  const {data,error}=await client.from('portfolio_records').select('*').order('id').range(offset,offset+499);if(error)throw error;
  for(const row of data)await settle(row.kind,row.id,local=>mergeRemote(local,row));
  if(data.length<500)break;offset+=500;
 }
 // Retry object deletion until confirmed, even if the metadata tombstone synced earlier.
 for(const record of await read('files'))if(record._deleted&&!record._dirty&&!record._conflict&&record.cloudPath){
  const {error}=await client.storage.from(BUCKET).remove([record.cloudPath]);
  if(error){failures++;await settle('files',record.id,c=>({...c,_syncError:'File cleanup pending: '+error.message}));}
  else await settle('files',record.id,c=>({...c,cloudPath:null,_syncError:null}));
 }
 return {failures};
}
