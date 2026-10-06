// BUKAKI cloud sync via Supabase
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

  window.cloudSave = async function(data){
    try {
      await window.supabaseClient.from('bukaki_state')
        .update({ data: data, updated_at: new Date().toISOString() })
        .eq('id', 'main');
    } catch(e) { console.error('Cloud save failed', e); }
  };
})();
