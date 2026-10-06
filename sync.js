// BUKAKI cloud sync via Supabase - MERGE version
(function(){
  var SUPABASE_URL = 'https://itjpfjlmyimbfbijucza.supabase.co';
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

  function mergeDB(cloud, local){
    if(!cloud || !local) return local;
    var result = JSON.parse(JSON.stringify(local));
    var arrayKeys = ['members','events','announcements','prayerIntentions','payments','loans','elections','candidacies','votes','warnings','amendments','attendance'];
    arrayKeys.forEach(function(k){
      result[k] = mergeArrays(cloud[k], local[k]);
    });
    result.families = local.families || cloud.families;
    result.currentUserId = local.currentUserId;
    return result;
  }

  window.cloudSave = async function(data){
    try {
      var cur = await window.supabaseClient.from('bukaki_state').select('data').eq('id','main').single();
      var cloudData = (cur.data && cur.data.data) ? cur.data.data : {};
      var merged = mergeDB(cloudData, data);
      await window.supabaseClient.from('bukaki_state')
        .update({ data: merged, updated_at: new Date().toISOString() })
        .eq('id', 'main');
      return merged;
    } catch(e) {
      console.error('Cloud save failed', e);
      return null;
    }
  };
})();
