// BUKAKI cloud sync - merge-safe
(function(){
  var SUPABASE_URL = 'https://itjpfjlmylmbfbijucza.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0anBmamxteWxtYmZiaWp1Y3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyOTMyOTEsImV4cCI6MjEwNjg2OTI5MX0.zzQ93QQPz6kO2ailCXx1KvRHMim0KkWMoiWx6-wXhyc';

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  window.cloudLoad = async function(){
    try {
      var res = await window.supabaseClient.from('bukaki_state').select('data').eq('id','main').single();
      if (res.error) return null;
      return res.data ? res.data.data : null;
    } catch(e) { return null; }
  };

  function mergeArrays(cloud, local){
    var map = {};
    (cloud || []).forEach(function(item){ if(item && item.id) map[item.id] = item; });
    (local || []).forEach(function(item){ if(item && item.id) map[item.id] = item; });
    return Object.keys(map).map(function(k){ return map[k]; });
  }

  window.mergeDB = function(cloud, local){
    if(!cloud) return local;
    if(!local) return cloud;
    var result = JSON.parse(JSON.stringify(local));
    var keys = ['members','events','announcements','prayerIntentions','payments','loans','elections','candidacies','votes','warnings','amendments','attendance'];
    keys.forEach(function(k){ result[k] = mergeArrays(cloud[k], local[k]); });
    result.families = local.families || cloud.families;
    result.currentUserId = local.currentUserId;
    return result;
  };

  window.cloudSave = async function(data){
    try {
      var cur = await window.supabaseClient.from('bukaki_state').select('data').eq('id','main').single();
      var cloudData = (cur.data && cur.data.data) ? cur.data.data : {};
      var merged = window.mergeDB(cloudData, data);
      var upd = await window.supabaseClient.from('bukaki_state')
        .update({ data: merged, updated_at: new Date().toISOString() })
        .eq('id', 'main');
      if (upd.error) { alert('Save failed: ' + JSON.stringify(upd.error)); return null; }
      return merged;
    } catch(e) { alert('Save error: ' + e.message); return null; }
  };
})();
