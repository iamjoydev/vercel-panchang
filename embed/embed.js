(function(){
  function parseAttrs(script){
    return {
      endpoint: script.getAttribute("data-endpoint"),
      lat: script.getAttribute("data-lat"),
      lon: script.getAttribute("data-lon"),
      tz: script.getAttribute("data-tz") || "Asia/Kolkata",
      target: script.getAttribute("data-target") || "panchang-widget"
    };
  }

  function render(targetEl, data){
    if(!targetEl) return;
    const p = data.panchangam;
    targetEl.innerHTML = `
      <div class="panchang-card">
        <div><strong>Date:</strong> ${data.meta.date}</div>
        <div><strong>Tithi:</strong> ${p.tithi_name || p.tithi}</div>
        <div><strong>Nakshatra:</strong> ${p.nakshatra_name || p.nakshatra}</div>
        <div><strong>Yoga:</strong> ${p.yoga_name || p.yoga}</div>
        <div><strong>Karna:</strong> ${p.karana}</div>
        <div><strong>Sunrise:</strong> ${p.sunrise ? new Date(p.sunrise).toLocaleTimeString() : 'â€”'}</div>
        <div><strong>Sunset:</strong> ${p.sunset ? new Date(p.sunset).toLocaleTimeString() : 'â€”'}</div>
      </div>`;
  }

  document.addEventListener("DOMContentLoaded", function(){
    var scripts = document.getElementsByTagName("script");
    for(var i=0;i<scripts.length;i++){
      var s = scripts[i];
      if(s.getAttribute("data-endpoint")){
        var cfg = parseAttrs(s);
        var targetEl = document.getElementById(cfg.target) || document.createElement("div");
        if(!document.getElementById(cfg.target)){
          targetEl.id = cfg.target;
          s.parentNode.insertBefore(targetEl, s);
        }
        var url = cfg.endpoint + "?tz=" + encodeURIComponent(cfg.tz);
        if(cfg.lat && cfg.lon) url += "&lat=" + cfg.lat + "&lon=" + cfg.lon;
        fetch(url).then(r=>r.json()).then(json=>render(targetEl,json)).catch(e=>console.error(e));
      }
    }
  });
})();
