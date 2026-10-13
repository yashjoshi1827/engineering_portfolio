export const stores=['logs','notes','goals','announcements','files'];
export function cleanRecord(record){return Object.fromEntries(Object.entries(record).filter(([key])=>!key.startsWith('_')));}
export function fromRemote(row){return {...row.payload,id:row.id,_revision:row.revision,_deleted:row.deleted,_dirty:false,_operation:row.operation_id};}
// Called inside an IndexedDB transaction: edits made while a request is in flight survive.
export function acknowledge(current,sent,result){
 if(!current)return current;
 if(!result.ok)return {...current,_conflict:result.record||{revision:0,deleted:true,payload:{}},_syncError:'Changed on another device. Review both copies.'};
 if(current._operation!==sent._operation)return {...current,_revision:result.record.revision};
 return {...current,_revision:result.record.revision,_dirty:false,_conflict:null,_syncError:null};
}
export function mergeRemote(local,remote){
 if(!local)return fromRemote(remote);
 if(local._dirty){
   if(remote.operation_id===local._operation)return acknowledge(local,local,{ok:true,record:remote});
   if(remote.revision!==(local._revision||0))return {...local,_conflict:remote,_syncError:'Changed on another device. Review both copies.'};
   return local;
 }
 return remote.revision>(local._revision||0)?fromRemote(remote):local;
}
