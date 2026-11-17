(() => {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- urgency levels ---------- */
  const U = [
    { label: 'Drive it in', c: 'var(--go)', deg: -80, lcd: 'DRIVE IT IN' },
    { label: 'This week', c: 'var(--warn)', deg: 0, lcd: 'THIS WEEK' },
    { label: "Don't drive it", c: 'var(--stop)', deg: 80, lcd: "DON'T DRIVE IT" }
  ];

  const REVIEWS = {
    nicole: { q: 'My car wouldn’t start… I brought my car in at noon on Saturday, and had it back same day before 2pm.', who: 'Nicole, Google review' },
    aaron: { q: 'I went in for an oil change and they had me in and out in less than 25 minutes!', who: 'Aaron, Google review' },
    joseph: { q: 'Fixed 3 of my cars. Quick, friendly, affordable.', who: 'Joseph, Google review' }
  };

  /* ---------- symptoms: plain mechanic talk, "usually", never a price ---------- */
  const S = [
    { id: 'squeal', label: 'Squeals when I brake', light: 'brake', lcd: 'BRAKES · SQUEAL', q: 'How does the pedal feel?', a: [
      { t: 'Normal', u: 1, h: 'Usually the brake pads are getting thin.', b: 'Most pads have a little metal tab that squeals on purpose when they wear down. It’s a reminder, not an emergency. Bring it in this week, before the squeal turns into grinding and the job grows to rotors too.', svc: 'Brakes' },
      { t: 'Soft, or it sinks', u: 2, h: 'That can be air or a leak in the brake lines.', b: 'A soft or sinking pedal means the car may not stop when you need it to. Don’t drive it. Call us first and we’ll talk about getting it here.', svc: 'Brakes' } ] },
    { id: 'grind', label: 'Grinding noise', light: 'brake', lcd: 'GRINDING', q: 'When do you hear it?', a: [
      { t: 'When I brake', u: 2, h: 'Usually the pads are worn down to metal.', b: 'Metal on metal stops worse and chews up the rotors every time you brake. Call before you drive it, and keep it short if you have to.', svc: 'Brakes' },
      { t: 'When I turn', u: 1, h: 'Often a CV joint or a wheel bearing.', b: 'A grind or click that comes with turning usually points to the axle joints or a bearing. Not a today problem, but it gets louder and costs more the longer it goes. Bring it in this week.', svc: 'Suspension & steering' },
      { t: 'Gets louder with speed', u: 1, h: 'Often a wheel bearing.', b: 'A hum or growl that rises with speed and doesn’t change when you brake is the classic bearing sound. Bring it in this week.', svc: 'Suspension & steering' } ] },
    { id: 'cel', label: 'Check-engine light is on', light: 'engine', lcd: 'CHECK ENGINE', q: 'Is the light steady or flashing?', a: [
      { t: 'Steady', u: 1, h: 'Something set a code. The computer reads it.', b: 'A steady light can be anything from a loose gas cap to a sensor or an ignition part. Usually fine to drive while you book in. We plug in, read the code and find out what it actually is.', svc: 'Diagnostics' },
      { t: 'Flashing', u: 2, h: 'Flashing usually means the engine is misfiring.', b: 'Unburnt fuel can cook the catalytic converter, and that turns a small fix into a big one. Ease off, and call before you drive it any further.', svc: 'Diagnostics', blink: true } ] },
    { id: 'pull', label: 'Pulls to one side', light: 'steer', lcd: 'PULLS TO ONE SIDE', q: 'All the time, or only when you brake?', a: [
      { t: 'All the time', u: 0, h: 'Usually alignment or tire pressure.', b: 'Check the tires are evenly pumped up first. If they are, the alignment is probably off, often after a pothole. Fine to drive in. The sooner it’s set, the less it eats your tires.', svc: 'Tires & alignment' },
      { t: 'Only when I brake', u: 1, h: 'Often a brake caliper that’s sticking.', b: 'One side grabbing harder than the other pulls the car when you stop. Bring it in this week.', svc: 'Brakes' } ] },
    { id: 'shake', label: 'Shakes at speed', light: 'tire', lcd: 'SHAKES AT SPEED', q: 'When does it shake?', a: [
      { t: 'Around highway speed', u: 0, h: 'Usually a wheel out of balance.', b: 'A shake in the steering wheel around 50 to 70 mph is most often wheel balance, sometimes a damaged tire. Look the tires over for bulges. If they look fine, drive it in.', svc: 'Tires & alignment' },
      { t: 'When I brake', u: 1, h: 'Usually warped brake rotors.', b: 'A shudder through the pedal or the wheel as you slow down points to the rotors. Bring it in this week.', svc: 'Brakes' },
      { t: 'There’s a bulge on a tire', u: 2, h: 'A bulge means the tire can let go.', b: 'Don’t drive on it. Put the spare on, or call us first.', svc: 'Tires & alignment' } ] },
    { id: 'nostart', label: 'Won’t start', light: 'battery', lcd: 'WON’T START', q: 'What happens when you turn the key?', a: [
      { t: 'Clicks, or nothing at all', u: 2, lab: 'Call first', h: 'Usually the battery, its cables or the starter.', b: 'A jump tells you a lot: if it starts on a jump, it’s likely the battery or the charging side. If it doesn’t, it may be the starter. Call first and we’ll work out how to get it here.', svc: 'Diagnostics', review: 'nicole' },
      { t: 'Cranks but won’t catch', u: 2, lab: 'Call first', h: 'Usually fuel or spark.', b: 'The engine turns over but never fires: often a fuel pump, a sensor or an ignition part. Don’t keep cranking, it flattens the battery. Call us.', svc: 'Diagnostics', review: 'nicole' } ] },
    { id: 'ac', label: 'AC blows warm', light: 'ac', lcd: 'A/C BLOWS WARM', q: 'Any cold air at all?', a: [
      { t: 'A little, not enough', u: 0, h: 'Usually low refrigerant, which means a small leak.', b: 'AC is a sealed system, so if it’s low, it leaked somewhere. The real fix is finding the leak, not just topping it up. Fine to drive.', svc: 'A/C' },
      { t: 'None at all', u: 0, h: 'Often the compressor, its clutch, or an electrical part.', b: 'If the fan blows but nothing gets cold, the compressor may not be kicking on. Fine to drive while you book in.', svc: 'A/C' } ] },
    { id: 'burn', label: 'Burning smell', light: 'temp', lcd: 'BURNING SMELL', q: 'What does it smell like?', a: [
      { t: 'Sweet, like syrup', u: 1, h: 'Usually leaking coolant.', b: 'Watch the temperature gauge. If it climbs toward hot, pull over and shut it off. If it stays normal, bring it in this week.', svc: 'Engine & cooling' },
      { t: 'Burnt oil', u: 1, h: 'Usually oil dripping on the hot exhaust.', b: 'A valve cover or gasket leak is the usual suspect. Check the dipstick and top it up, then bring it in this week.', svc: 'Engine & cooling' },
      { t: 'Burnt rubber, plastic, or smoke', u: 2, h: 'Could be a stuck brake, a slipping belt or wiring.', b: 'Pull over and shut the engine off. Don’t drive it. Call us.', svc: 'Diagnostics' } ] },
    { id: 'puddle', label: 'Puddle under the car', light: 'oil', lcd: 'PUDDLE UNDER CAR', q: 'What colour is it?', a: [
      { t: 'Clear water', u: 0, lab: 'Nothing to fix', h: 'Usually just the AC draining. Normal.', b: 'Clear, no smell, under the front on a warm day: that’s condensation from the AC. Nothing to fix.', svc: '' },
      { t: 'Green, orange or pink', u: 1, h: 'That’s coolant.', b: 'Keep an eye on the temperature gauge and bring it in this week, before it runs low and overheats.', svc: 'Engine & cooling' },
      { t: 'Brown or black', u: 1, h: 'Usually engine oil.', b: 'Check the dipstick. A few drops can wait a few days; a puddle can’t. Bring it in this week.', svc: 'Oil change & maintenance' },
      { t: 'Red', u: 1, h: 'Usually transmission or power-steering fluid.', b: 'Both matter. Bring it in this week.', svc: 'Transmission' } ] },
    { id: 'oil', label: 'Just due for an oil change', light: 'service', lcd: 'OIL CHANGE', q: null, a: [
      { t: null, u: 0, lab: 'Easy one', h: 'Oil and filter. Call ahead and come by.', b: 'Give us a call to see when we can fit you in, or send the details below and we’ll call you.', svc: 'Oil change & maintenance', review: 'aaron' } ] }
  ];

  /* ---------- dial ---------- */
  const dial = $('.dial');
  const CX = 150, CY = 150;
  const pt = (deg, r) => { const a = deg * Math.PI / 180; return [CX + r * Math.sin(a), CY - r * Math.cos(a)]; };
  const arc = (a0, a1, r) => { const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r); return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
  if (dial) {
    let t = '';
    for (let d = -120; d <= 120; d += 10) {
      const maj = d % 40 === 0, [x0, y0] = pt(d, 106), [x1, y1] = pt(d, maj ? 92 : 98);
      t += `<line class="${maj ? 'maj' : ''}" x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"/>`;
    }
    $('.ticks', dial).innerHTML = t;
    $('.z0', dial).setAttribute('d', arc(-120, -41.5, 118));
    $('.z1', dial).setAttribute('d', arc(-38.5, 38.5, 118));
    $('.z2', dial).setAttribute('d', arc(41.5, 120, 118));
    [[-120, -40, '#la0'], [-40, 40, '#la1'], [40, 120, '#la2']].forEach(([a0, a1, s]) => $(s, dial).setAttribute('d', arc(a0, a1, 129)));
  }
  const needle = dial && $('.needle', dial);
  const setNeedle = deg => { if (needle) needle.style.transform = `rotate(${deg}deg)`; };
  const setZone = u => { $$('.zone, .zl', dial).forEach(e => e.classList.remove('on')); if (u != null) { $('.z' + u, dial).classList.add('on'); $('.zl' + u, dial).classList.add('on'); } };

  /* ---------- lcd + lights ---------- */
  const lcd = $('.lcd');
  const setLcd = (main, sub) => {
    $('.lcd-main', lcd).textContent = main; $('.lcd-sub', lcd).textContent = sub;
    lcd.classList.remove('flip'); void lcd.offsetWidth; lcd.classList.add('flip');
  };
  const lights = $$('.tell');
  const setLight = (name, color, blink) => lights.forEach(l => {
    const on = l.dataset.l === name;
    l.classList.toggle('on', on); l.classList.toggle('blink', on && !!blink);
    if (on) l.style.setProperty('--c', color); else l.style.removeProperty('--c');
  });

  /* ---------- live region for screen readers ---------- */
  const live = document.createElement('p');
  live.className = 'sr'; live.setAttribute('aria-live', 'polite');
  live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
  document.body.appendChild(live);

  /* ---------- finder (tick one or several) ---------- */
  const pick = $('#pick'), step = $('#step'), finder = $('.finder');
  pick.innerHTML = `<div class="wo"><div class="wo-head"><span>Customer states</span><span>tick all that apply</span></div><ul class="opts">${
    S.map(s => `<li><button type="button" class="opt" data-id="${s.id}" aria-pressed="false"><span class="box" aria-hidden="true"></span>${esc(s.label)}</button></li>`).join('')
  }<li><button type="button" class="opt other" data-id="other"><span class="box" aria-hidden="true"></span>Something else</button></li><li><a class="opt" href="tel:+19733395556"><span class="box" aria-hidden="true" style="border-color:var(--blue)"></span>Rather just talk it through</a></li></ul>
  <div class="go-bar"><button type="button" class="pill pill-blue go" disabled>Tick what it's doing</button></div></div>`;

  const goBtn = $('.go', pick);
  let picked = [];            // symptom ids, in the order ticked
  const answers = {};         // id -> answer index
  const sym = id => S.find(x => x.id === id);

  const lightsFor = () => lights.forEach(l => {
    const hits = S.filter(x => picked.includes(x.id) && x.light === l.dataset.l);
    if (!hits.length) { l.classList.remove('on', 'blink'); l.style.removeProperty('--c'); return; }
    let u = -1, blink = false;
    hits.forEach(x => { const i = answers[x.id]; if (i != null) { const a = x.a[i]; if (a.u > u) u = a.u; if (a.blink) blink = true; } });
    l.classList.add('on'); l.classList.toggle('blink', blink);
    l.style.setProperty('--c', u < 0 ? 'var(--warn)' : U[u].c);
  });

  const syncPick = () => {
    $$('.opt[data-id]', pick).forEach(b => { if (b.dataset.id !== 'other') b.setAttribute('aria-pressed', String(picked.includes(b.dataset.id))); });
    const n = picked.length;
    goBtn.disabled = !n;
    goBtn.textContent = n ? (n === 1 ? 'Check this one' : `Check these ${n}`) : 'Tick what it’s doing';
    lightsFor();
    if (n) setLcd(n === 1 ? sym(picked[0]).lcd : `${n} THINGS`, n === 1 ? 'tick more, or check it' : 'tap check below');
    else setLcd('PICK WHAT IT’S DOING', 'one thing or several');
  };

  const worst = () => {
    let w = null;
    picked.forEach(id => { const s = sym(id), i = answers[id]; if (i != null && (!w || s.a[i].u > w.a.u)) w = { s, a: s.a[i] }; });
    return w;
  };

  const showPick = () => {
    step.hidden = true; pick.hidden = false; finder.classList.remove('open');
    setZone(null); setNeedle(-120); syncPick();
    goBtn.focus({ preventScroll: true });
  };

  const blockHTML = s => {
    const i = answers[s.id], a = i != null ? s.a[i] : null;
    const r = a && a.review && REVIEWS[a.review];
    return `<div class="sym" data-id="${s.id}">
      <p class="sym-name"><span class="box" aria-hidden="true"></span>${esc(s.label)}</p>
      ${s.q ? `<div class="q"><h3>${esc(s.q)}</h3><div class="answers">${s.a.map((x, k) => `<button type="button" class="ans" data-i="${k}" aria-pressed="${k === i}">${esc(x.t)}</button>`).join('')}</div></div>` : ''}
      ${a ? `<div class="verdict" style="--c:${U[a.u].c}"><span class="stamp"><i></i>${esc(a.lab || U[a.u].label)}</span><h3 class="v-head">${esc(a.h)}</h3><p class="v-body">${esc(a.b)}</p>${r ? `<p class="v-review">“${esc(r.q)}”<b>${esc(r.who)}</b></p>` : ''}</div>` : ''}
    </div>`;
  };

  const callBtn = cls => `<a class="pill ${cls}" href="tel:+19733395556"><svg class="ico" aria-hidden="true"><use href="#i-phone"/></svg>Call (973) 339-5556</a>`;

  const summaryHTML = () => {
    const w = worst(), n = picked.length, left = picked.filter(id => answers[id] == null).length;
    if (!w && n === 1) return '';
    if (left) return `<div class="sum"><p class="v-note">Answer ${left === 1 ? 'the last question' : 'the questions above'} to see what to do.</p></div>`;
    const u = w.a.u, send = `<button type="button" class="pill ${u === 2 ? 'pill-line' : 'pill-blue'}" data-send>${n > 1 ? 'Send all of this to CJ' : 'Send this to CJ'}</button>`;
    return `<div class="sum" style="--c:${U[u].c}">
      ${n > 1 ? `<p class="sum-line">Overall: <b>${esc(w.a.lab || U[u].label)}</b>${u === 2 ? `, because of “${esc(w.s.label.toLowerCase())}”.` : '.'}</p>` : ''}
      <div class="v-actions">${u === 2 ? callBtn('pill-blue') + send : send + callBtn('pill-line')}</div>
      <p class="v-note">A starting point, not a diagnosis. We look at the car before we say what it needs.</p>
    </div>`;
  };

  const renderStep = scrollSel => {
    const n = picked.length;
    step.innerHTML = `<div class="picked"><span>${n === 1 ? 'Your car' : `Your car: ${n} things`}</span><button type="button" class="back">Change</button></div>${
      picked.map(id => blockHTML(sym(id))).join('')}${summaryHTML()}`;
    const w = worst();
    if (w) { setZone(w.a.u); setNeedle(U[w.a.u].deg); setLcd((w.a.lab || U[w.a.u].lcd).toUpperCase(), n === 1 ? w.s.lcd : `${n} THINGS CHECKED`); }
    else { setZone(null); setNeedle(-120); setLcd(n === 1 ? sym(picked[0]).lcd : `${n} THINGS`, 'answer below'); }
    lightsFor();
    if (scrollSel) {
      const el = $(scrollSel, step);
      if (el) { const t = el.getBoundingClientRect().top; if (t > innerHeight * .7 || t < 70) el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); }
    }
  };

  const openStep = () => {
    if (!picked.length) return;
    picked.forEach(id => { if (!sym(id).q) answers[id] = 0; });   // oil change has no follow-up
    pick.hidden = true; step.hidden = false; finder.classList.add('open');
    renderStep();
    step.focus({ preventScroll: true });
    if (step.getBoundingClientRect().top < 70) step.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    live.textContent = picked.map(id => { const s = sym(id); return s.q ? `${s.label}: ${s.q}` : s.label; }).join('. ');
  };

  pick.addEventListener('click', e => {
    if (e.target.closest('.go')) { openStep(); return; }
    const b = e.target.closest('button.opt'); if (!b) return;
    const id = b.dataset.id;
    if (id === 'other') { fillQuote(false); return; }
    if (picked.includes(id)) { picked = picked.filter(x => x !== id); delete answers[id]; } else picked.push(id);
    syncPick();
  });
  step.addEventListener('click', e => {
    if (e.target.closest('.back')) { showPick(); return; }
    const b = e.target.closest('.ans');
    if (b) {
      const id = b.closest('.sym').dataset.id, a = sym(id).a[+b.dataset.i];
      answers[id] = +b.dataset.i;
      const next = picked.find(x => answers[x] == null);
      renderStep(next ? `.sym[data-id="${next}"]` : (picked.length > 1 ? '.sum' : `.sym[data-id="${id}"] .verdict`));
      const nb = $(`.sym[data-id="${id}"] .ans[data-i="${b.dataset.i}"]`, step); nb && nb.focus({ preventScroll: true });
      live.textContent = `${a.lab || U[a.u].label}. ${a.h}`;
      return;
    }
    if (e.target.closest('[data-send]')) fillQuote(true);
  });

  /* ---------- hand-off to the quote form ---------- */
  function fillQuote(withPicks) {
    const f = $('#qform');
    if (f && withPicks) {
      const w = worst();
      f.service.value = (w && w.a.svc) || '';
      f.issue.value = picked.map(id => { const s = sym(id), a = s.a[answers[id]]; return `${s.label}${a.t ? ' (' + a.t.toLowerCase() + ')' : ''}: ${a.h} ${a.lab || U[a.u].label}.`; }).join('\n');
    }
    const q = $('#quote');
    q && q.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    f && setTimeout(() => f.year.focus({ preventScroll: true }), RM ? 0 : 700);
  }

  syncPick();

  /* ---------- key-on self test (like a real cluster) ---------- */
  if (!RM && needle) {
    const b = $('.binnacle');
    lights.forEach((l, i) => l.style.setProperty('--c0', ['#D7322B', '#F2A516', '#F2A516', '#D7322B', '#D7322B', '#D7322B', '#F2A516', '#8FB3FF', '#F2A516'][i]));
    b.classList.add('boot');
    needle.style.transition = 'transform .7s cubic-bezier(.45,0,.2,1)';
    requestAnimationFrame(() => requestAnimationFrame(() => setNeedle(120)));
    setTimeout(() => { setNeedle(-120); b.classList.remove('boot'); }, 900);
    setTimeout(() => { needle.style.transition = ''; }, 1650);
  }

  /* ---------- service menu links preselect the form ---------- */
  $$('[data-svc]').forEach(a => a.addEventListener('click', () => {
    const f = $('#qform'); if (!f) return;
    f.service.value = a.dataset.svc;
    if (!f.issue.value) f.issue.placeholder = a.textContent + ': what is it doing, and since when?';
  }));

  /* ---------- quote form (front end only) ---------- */
  const form = $('#qform');
  if (form) {
    const conf = $('#confirm'), err = $('#form-err');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.name.value.trim(), phone = form.phone.value.trim();
      form.name.closest('.f').classList.toggle('bad', !name);
      form.phone.closest('.f').classList.toggle('bad', !phone);
      if (!name || !phone) { err.hidden = false; (name ? form.phone : form.name).focus(); return; }
      err.hidden = true;
      const car = [form.year.value, form.make.value, form.model.value].map(v => v.trim()).filter(Boolean).join(' ');
      const what = form.service.value || 'A look at the car';
      const when = form.time.value ? form.time.value.toLowerCase() : 'during shop hours';
      conf.innerHTML = '';
      const b = document.createElement('b');
      b.textContent = `${what}${car ? ' for a ' + car : ''}, for ${name.split(/\s+/)[0]}.`;
      const p1 = document.createElement('p');
      p1.textContent = `We'd call ${phone} ${form.time.value ? 'in the ' + when : when}.`;
      const p2 = document.createElement('p');
      p2.textContent = 'Preview only: nothing was sent. On the real site, the shop calls or texts you back.';
      conf.append(b, p1, p2);
      conf.hidden = false;
      conf.focus({ preventScroll: true });
      conf.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- today's hours + open now (shop time, America/New_York) ---------- */
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    const g = t => parts.find(p => p.type === t).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday'));
    const mins = (+g('hour') % 24) * 60 + +g('minute');
    const row = $(`.hours tr[data-d="${day}"]`); row && row.classList.add('today');
    const close = day === 0 ? 0 : day === 6 ? 15 * 60 : 18 * 60;
    const open = close && mins >= 480 && mins < close;
    const on = $('#open-now');
    if (on) {
      on.textContent = open ? `Open now, until ${day === 6 ? '3' : '6'} pm` : 'Closed right now';
      on.style.setProperty('--c', open ? 'var(--go)' : 'var(--stop)');
      on.hidden = false;
    }
  } catch (e) { /* hours table still shows the full week */ }

  /* ---------- logo / back to top: scroll to the very top ---------- */
  $$('a[href="#top"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }));

  /* ---------- map: swap the still for the live Google map on tap ---------- */
  const still = $('.map-still');
  if (still) still.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.title = 'Map: CJ Auto Repair Center, 31 Orange St, Bloomfield';
    f.src = still.dataset.src;
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.allowFullscreen = true;
    still.replaceWith(f);
    f.focus();
  });

  /* ---------- reveal on scroll (house standard) ---------- */
  (() => {
    const els = $$('[data-reveal]');
    if (RM || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-visible')); return; }
    const n = new Map();
    els.forEach(e => { const p = e.parentElement, i = n.get(p) || 0; e.style.setProperty('--d', i * .08 + 's'); n.set(p, i + 1); });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: .01, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
    setTimeout(() => els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('is-visible'); }), 1500);
  })();
})();
