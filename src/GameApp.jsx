import { useEffect, useRef, useState } from 'react';
import GameScene from './GameScene.jsx';
import './game-hud.css';
import './mobile-overrides.css';

const stages = [
  { id: 'opening', title: 'ქუჩა', tiny: 'FREE ROAM' },
  { id: 'phone', title: 'არჩევანი', tiny: 'PHONE' },
  { id: 'pickup', title: 'მოსვლა', tiny: 'PICKUP' },
  { id: 'drive', title: 'გზა', tiny: 'DRIVE' },
  { id: 'restaurant', title: 'ვახშამი', tiny: 'DINNER' },
];

const foodMenu = [
  { id: 'pasta', icon: '🍝', name: 'პასტა', note: 'კრემოვანი კარბონარა', tag: 'ITALIAN · ₾32' },
  { id: 'sushi', icon: '🍣', name: 'სუში', note: 'შეფის სეტი · 12 ნაჭერი', tag: 'JAPANESE · ₾48' },
  { id: 'pizza', icon: '🍕', name: 'პიცა', note: 'ტრიუფელი · მოცარელა', tag: 'ITALIAN · ₾36' },
  { id: 'khinkali', icon: '🥟', name: 'ხინკალი', note: 'ქალაქური · შავი პილპილი', tag: 'GEORGIAN · ₾24' },
  { id: 'ramen', icon: '🍜', name: 'რამენი', note: 'მისო · ნაზი ბულიონი', tag: 'JAPANESE · ₾34' },
  { id: 'salad', icon: '🥗', name: 'სალათი', note: 'ბურატა · ატამი · ბაზილიკი', tag: 'FRESH · ₾28' },
  { id: 'burger', icon: '🍔', name: 'ჩიზბურგერი', note: 'საქონლის ხორცი · ჩედარი', tag: 'HOUSE · ₾29' },
  { id: 'chicken-burger', icon: '🍔', name: 'ქათმის ბურგერი', note: 'ხრაშუნა ქათამი · აიოლი', tag: 'HOUSE · ₾27' },
  { id: 'fries', icon: '🍟', name: 'ფრი', note: 'ტრიუფელის სოუსით', tag: 'SIDES · ₾16' },
  { id: 'tacos', icon: '🌮', name: 'ტაკო', note: 'საქონელი · ლაიმი · სალსა', tag: 'MEXICAN · ₾31' },
  { id: 'steak', icon: '🥩', name: 'სტეიკი', note: 'პიურე · წიწაკის სოუსი', tag: 'GRILL · ₾58' },
  { id: 'wings', icon: '🍗', name: 'BBQ ფრთები', note: 'თაფლი · შებოლილი სოუსი', tag: 'GRILL · ₾26' },
  { id: 'salmon', icon: '🐟', name: 'ორაგული', note: 'ლიმონი · მწვანილი', tag: 'FRESH · ₾46' },
  { id: 'cheesecake', icon: '🍰', name: 'ჩიზქეიქი', note: 'ვანილი · კენკრის სოუსი', tag: 'DESSERT · ₾22' },
];

const drinkMenu = [
  { id: 'lemonade', icon: '🍋', name: 'ლიმონათი', note: 'ციტრუსი · როზმარინი' },
  { id: 'iced-tea', icon: '🧋', name: 'ცივი ჩაი', note: 'ატამი · ჟასმინი' },
  { id: 'matcha', icon: '🍵', name: 'მატჩა', note: 'მწვანე · ნუშის რძე' },
  { id: 'coffee', icon: '☕', name: 'ყავა', note: 'ფილტრი · შოკოლადი' },
  { id: 'tonic', icon: '🥤', name: 'ტონიკი', note: 'გრეიფრუტი · რეჰანი' },
  { id: 'mocktail', icon: '🍹', name: 'მოქტეილი', note: 'მარწყვი · ვარდის წყალი' },
  { id: 'coca-cola', icon: '🥤', name: 'კოკა-კოლა', note: 'ცივი · ყინულით' },
  { id: 'orange-soda', icon: '🍊', name: 'ფორთოხლის ლიმონათი', note: 'ციტრუსი · მსუბუქი' },
  { id: 'milkshake', icon: '🥛', name: 'მილქშეიქი', note: 'ვანილი · ნაღები' },
  { id: 'sparkling-water', icon: '💧', name: 'გაზიანი წყალი', note: 'ლიმონი · ყინული' },
];

const formspreeEndpoint = (import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/xwlpwawv').trim().replace(/\/+$/, '');

function getTime() {
  return new Intl.DateTimeFormat('ka-GE', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tbilisi' }).format(new Date());
}

function Header({ time, muted, fullscreen, onSound, onFullscreen }) {
  return (
    <header className="hud-header">
      <div className="brand-lockup"><span className="brand-mark">D<span>×</span>N</span><span className="brand-caption">ONE EVENING<br /><i>TBILISI · OPEN CITY</i></span></div>
      <div className="header-center"><span className="live-dot" /> ღია ქალაქი <span className="header-divider">/</span> <span>თბილისი · {time}</span></div>
      <div className="header-actions">
        <button className="sound-button" onClick={onSound} aria-label={muted ? 'ხმის ჩართვა' : 'ხმის გამორთვა'}><span className={`sound-bars ${muted ? 'is-muted' : ''}`}><i /><i /><i /><i /></span>{muted ? 'ხმა გამორთულია' : 'ღამის ხმა'}</button>
        <button className="fullscreen-button" onClick={onFullscreen} aria-label={fullscreen ? 'სრული ეკრანიდან გამოსვლა' : 'სრულ ეკრანზე გადასვლა'} title="სრული ეკრანი">⛶</button>
      </div>
    </header>
  );
}

function ProgressHUD({ stage }) {
  const current = stages.findIndex((item) => item.id === stage);
  return (
    <div className="game-progress" aria-label="საღამოს მისია">
      <div className="game-progress-meta"><span>DATE NIGHT <i>·</i> MAIN STORY</span><b>0{Math.max(1, current + 1)} / 05</b></div>
      <div className="game-progress-track">{stages.map((item, index) => <i className={index <= current ? 'is-lit' : ''} key={item.id} />)}</div>
      <div className="game-progress-labels">{stages.map((item) => <span className={item.id === stage ? 'is-active' : ''} key={item.id}>{item.tiny}</span>)}</div>
    </div>
  );
}

function MenuCard({ item, selected, onClick, kind }) {
  return (
    <button className={`choice-card choice-card--${kind} ${selected ? 'is-selected' : ''}`} onClick={onClick} aria-pressed={selected}>
      <span className="choice-icon">{item.icon}</span>
      <span className="choice-copy"><b>{item.name}</b><small>{item.note}</small>{item.tag && <i>{item.tag}</i>}</span>
      <span className="choice-check">{selected ? '✓' : '＋'}</span>
    </button>
  );
}

function PhoneLockScreen({ time, onUnlock }) {
  const swipeStart = useRef(null);
  const date = new Intl.DateTimeFormat('ka-GE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Tbilisi' }).format(new Date());
  const finishSwipe = (event) => {
    if (swipeStart.current === null) return;
    const distance = swipeStart.current - event.clientY;
    swipeStart.current = null;
    if (distance > 42) onUnlock();
  };
  return (
    <main className="iphone-lockscreen" onPointerDown={(event) => { swipeStart.current = event.clientY; }} onPointerUp={finishSwipe} onPointerCancel={() => { swipeStart.current = null; }}>
      <div className="lock-wallpaper-glow" />
      <div className="lock-clock"><span>{date}</span><strong>{time}</strong><i>თბილისი · 21°</i></div>
      <div className="lock-widgets"><span>◷ <b>დღეს საღამოს</b></span><span>✦ <b>ერთი ლამაზი საღამო</b></span></div>
      <section className="lock-notifications" aria-label="შეტყობინებები">
        <div className="lock-notification-label"><span>შეტყობინებები</span><b>1 შეტყობინება</b></div>
        <article className="lock-notification">
          <span className="lock-message-icon">მ</span>
          <div className="lock-notification-copy"><div><b>დემე</b><small>ახლა</small></div><p>ნინი, დღეს საღამოს ჩემთან ერთად წამოხვალ? 💌</p></div>
        </article>
      </section>
      <div className="lock-shortcuts"><span aria-hidden="true">◉</span><span aria-hidden="true">◎</span></div>
      <button className="lock-unlock" onClick={onUnlock}><span>↑</span> გასრიალება გასახსნელად</button>
    </main>
  );
}

function PhoneHomeScreen({ time, onOpenMessages }) {
  const apps = [
    { icon: '📷', name: 'კამერა', tone: 'camera' }, { icon: '🗺️', name: 'რუკები', tone: 'maps' },
    { icon: '🕰️', name: 'საათი', tone: 'clock' }, { icon: '🌤️', name: 'ამინდი', tone: 'weather' },
    { icon: '🎵', name: 'მუსიკა', tone: 'music' }, { icon: '📝', name: 'ჩანაწერები', tone: 'notes' },
    { icon: '🧭', name: 'კომპასი', tone: 'compass' },
  ];
  return (
    <main className="iphone-homescreen">
      <div className="home-welcome"><span>პარასკევი · საღამო</span><b>{time}</b></div>
      <div className="iphone-app-grid">
        {apps.slice(0, 3).map((app) => <div className="iphone-app" key={app.name}><span className={`iphone-app-icon app-tone-${app.tone}`}>{app.icon}</span><small>{app.name}</small></div>)}
        <button className="iphone-app iphone-app--messages" onClick={onOpenMessages}><span className="iphone-app-icon app-tone-messages">✉</span><small>Messages</small><i className="app-unread-dot" /></button>
        {apps.slice(3).map((app) => <div className="iphone-app" key={app.name}><span className={`iphone-app-icon app-tone-${app.tone}`}>{app.icon}</span><small>{app.name}</small></div>)}
      </div>
      <div className="iphone-dock">
        <span className="iphone-app-icon app-tone-phone">☎</span><span className="iphone-app-icon app-tone-browser">◉</span>
        <button className="iphone-app-icon app-tone-messages" onClick={onOpenMessages} aria-label="Messages">✉</button>
        <span className="iphone-app-icon app-tone-camera">📷</span>
      </div>
      <div className="home-page-dots"><i className="is-current" /><i /></div>
    </main>
  );
}

function MessagesApp({ food, drink, setFood, setDrink, fullscreen, onFullscreen, onAccept, onContinueWithoutEmail, onHome, emailConfigured, emailStatus }) {
  const selectedFood = foodMenu.find((item) => item.id === food);
  const selectedDrink = drinkMenu.find((item) => item.id === drink);
  return (
    <div className="iphone-messages-app">
      <div className="phone-header">
        <button className="phone-back" onClick={onHome} aria-label="აპებში დაბრუნება">‹</button><span className="deme-avatar">დ</span>
        <div><b>დემე</b><small><i /> ონლაინ · შენთვის გეგმავს საღამოს</small></div>
        <span className="header-stars">●●●</span><button className="fullscreen-button phone-fullscreen" onClick={onFullscreen} aria-label={fullscreen ? 'სრული ეკრანიდან გამოსვლა' : 'სრულ ეკრანზე გადასვლა'}>⛶</button>
      </div>
      <div className="phone-body">
        <section className="message-column">
          <div className="message-date">დღეს · 21:14</div>
          <div className="message-bubble"><small>დემე</small><p>ნინი, დღეს საღამოს შენთან ერთად გასვლა მინდა. წამოხვალ?</p><span>21:14 ✓✓</span></div>
          <div className="invite-note"><i>✳</i><span>შენი პასუხი საღამოს გეგმას<br />მშვენივრად დაასრულებს.</span></div>
          <div className="order-recap"><small>შენი არჩევანი</small><b>{selectedFood?.name || 'საჭმელი'} <span>·</span> {selectedDrink?.name || 'სასმელი'}</b><i>{emailConfigured ? 'არჩეული შეკვეთა ელფოსტაზე გაიგზავნება' : 'ელფოსტისთვის Formspree endpoint დასაყენებელია'}</i></div>
        </section>
        <section className="choice-column">
          <div className="choice-heading"><div><span className="eyebrow-small">შენ გადაწყვიტე</span><h2>რას შევუკვეთოთ?</h2></div><span className="choice-step">{foodMenu.length} <i>კერძი</i></span></div>
          <p className="choice-label">საჭმელი <span>ერთი აირჩიე</span></p>
          <div className="choice-grid">{foodMenu.map((item) => <MenuCard key={item.id} item={item} kind="food" selected={food === item.id} onClick={() => setFood(item.id)} />)}</div>
          <div className="drink-heading"><p className="choice-label">სასმელი <span>კიდევ ერთი</span></p><span className="mini-spark">{drinkMenu.length} არჩევანი</span></div>
          <div className="drink-grid">{drinkMenu.map((item) => <MenuCard key={item.id} item={item} kind="drink" selected={drink === item.id} onClick={() => setDrink(item.id)} />)}</div>
          <div className="send-row"><button className="primary-button send-button" onClick={onAccept} disabled={!food || !drink || emailStatus.state === 'sending'}><span>{emailStatus.state === 'sending' ? 'იგზავნება…' : 'კი, წავიდეთ'}</span><i>{emailStatus.state === 'sending' ? '◌' : '↗'}</i></button><span className={`order-submit-note is-${emailStatus.state}`} role="status" aria-live="polite">{emailStatus.message || 'ერთი ლამაზი საღამო სულ ახლოსაა.'}</span></div>
          {(emailStatus.state === 'missing' || emailStatus.state === 'error') && <button className="offline-continue" onClick={onContinueWithoutEmail}>გაგრძელება ელფოსტის გარეშე <i>↗</i></button>}
        </section>
      </div>
      <div className="phone-watermark">D × N <span>YOUR EVENING BEGINS HERE</span></div>
    </div>
  );
}

function PhoneWorld({ view, time, food, drink, setFood, setDrink, fullscreen, onFullscreen, onAccept, onContinueWithoutEmail, emailConfigured, emailStatus, onUnlock, onOpenMessages, onHome }) {
  return (
    <div className={`phone-world game-phone phone-world--${view}`}>
      <div className="iphone-device">
        <div className="iphone-side-button iphone-side-button--left" /><div className="iphone-side-button iphone-side-button--right" />
        <div className={`iphone-screen iphone-screen--${view}`}>
          <div className="iphone-status"><span>{time}</span><i className="iphone-dynamic-island" /><span>◔ ◔ ▰</span></div>
          {view === 'lock' && <PhoneLockScreen time={time} onUnlock={onUnlock} />}
          {view === 'home' && <PhoneHomeScreen time={time} onOpenMessages={onOpenMessages} />}
          {view === 'messages' && <MessagesApp food={food} drink={drink} setFood={setFood} setDrink={setDrink} fullscreen={fullscreen} onFullscreen={onFullscreen} onAccept={onAccept} onContinueWithoutEmail={onContinueWithoutEmail} onHome={onHome} emailConfigured={emailConfigured} emailStatus={emailStatus} />}
          {view !== 'lock' && <button className="iphone-home-indicator" onClick={onHome} aria-label="აპებში დაბრუნება" />}
        </div>
      </div>
    </div>
  );
}

function MiniMap({ position, stage, carArrived, nearCar, driveProgress, dinnerReady, dateFinished }) {
  const mapX = 90 + Math.max(-12, Math.min(12, position.x)) * 3.2;
  const mapY = 108 - (Math.max(-42, Math.min(98, position.z)) + 42) * 0.55;
  const carX = 90 - 3.05 * 3.2;
  const carY = 108 - (1.2 + 42) * 0.55;
  const carDistance = Math.round(Math.hypot(position.x + 3.05, position.z - 1.2) * 12);
  const objective = stage === 'opening' ? 'ტელეფონი შეამოწმე'
    : stage === 'pickup' ? carArrived ? nearCar ? 'მანქანაში ჩაჯექი' : 'დემეს მანქანასთან მიდი' : 'დემეს ველოდებით'
      : stage === 'drive' ? 'რესტორანი · ვერა'
        : dateFinished ? 'საღამო დასრულდა' : dinnerReady ? 'მაგიდასთან · საუბარი' : 'მაგიდისკენ მიდიხართ';
  const distance = stage === 'opening' ? 'F'
    : stage === 'pickup' ? carArrived ? `${carDistance} მ` : 'ETA'
      : stage === 'drive' ? `${Math.round((1 - driveProgress) * 420)} მ`
        : dateFinished ? '✓' : dinnerReady ? 'E' : '…';
  const routePath = stage === 'drive'
    ? 'M90 84V31'
    : stage === 'pickup' && carArrived
      ? `M${mapX} ${mapY}L${carX} ${carY}`
      : `M${mapX} ${mapY}Q${(mapX + 90) / 2} ${(mapY + 31) / 2 - 8} 90 31`;
  return (
    <div className="minimap">
      <div className="minimap-title"><span><i /> TBILISI · GPS</span><b>{stage === 'drive' ? `${Math.round(driveProgress * 100)}%` : 'LIVE'}</b></div>
      <svg viewBox="0 0 180 130" role="img" aria-label="ქალაქის რუკა">
        <path className="map-road map-road-main" d="M90 0V130" /><path className="map-road" d="M0 32H180M0 67H180M0 101H180" />
        <path className="map-sidewalk" d="M78 0V130M102 0V130" /><path className="map-route" d={routePath} />
        <circle className="map-destination" cx="90" cy="31" r="4" />
        {(stage === 'opening' || stage === 'phone' || stage === 'pickup') && <g className="map-player" transform={`translate(${mapX} ${mapY})`}><circle r="7" /><path d="M0 -5 3 3 -3 3Z" /></g>}
        {carArrived && stage === 'pickup' && <circle className={`map-car ${nearCar ? 'is-near' : ''}`} cx={carX} cy={carY} r="3.5" />}
        {stage === 'drive' && <circle className="map-car" cx="90" cy={84 - Math.min(53, driveProgress * 53)} r="3.5" />}
        {stage === 'restaurant' && <circle className="map-player-marker" cx="90" cy="31" r="5.5" />}
      </svg>
      <div className="map-guidance"><span><i>↗</i>{objective}</span><b>{distance}</b></div>
      <div className="minimap-footer"><span>41°42′N 44°47′E</span><span>{stage === 'pickup' ? 'SABURTALO' : 'VERA'} <i>◢</i></span></div>
    </div>
  );
}

function MissionPanel({ stage, food, drink, carArrived, nearCar, atRestaurant, dinnerReady, dateFinished, dateScore, driveProgress, onOpenPhone, onEnterCar, onEnterRestaurant, onRestart }) {
  const dish = foodMenu.find((item) => item.id === food)?.name || 'შენი არჩევანი';
  const beverage = drinkMenu.find((item) => item.id === drink)?.name || 'სასმელი';
  const endingLine = dateScore >= 8 ? 'ნინი და დემე ღამის ქალაქში გასეირნებაზე შეთანხმდნენ.' : dateScore >= 5 ? 'საღამო თბილად დასრულდა — შემდეგი შეხვედრაც დაიგეგმება.' : 'საღამო მშვიდად დასრულდა, და ორივეს კიდევ ბევრი ჰქონდა მოსაყოლი.';
  return (
    <aside className={`mission-panel mission-panel--${stage}`}>
      {stage === 'opening' && <>
        <div className="mission-kicker"><i /> FREE ROAM <span>·</span> MISSION 01</div>
        <h1>ქალაქი<br /><em>შენ გელოდება.</em></h1>
        <p>მესიჯი მიიღე — ახლა ტელეფონი შეამოწმე და საღამო დაგეგმე.</p>
        <div className="mission-task"><b>01</b><span><small>მიმდინარე დავალება</small><strong>ტელეფონის აღება</strong><i>დააჭირე <kbd>F</kbd> ტელეფონის გასახსნელად</i></span><span className="mission-arrow">↗</span></div>
        <button className="primary-button mission-action" onClick={onOpenPhone}><span>ტელეფონის გახსნა</span><i>F</i></button>
        <div className="world-controls-label"><b>W A S D</b> მოძრაობა <span>·</span> <b>SHIFT</b> სირბილი</div>
      </>}
      {stage === 'pickup' && <>
        <div className="mission-kicker"><i className={carArrived ? 'is-arrived' : ''} /> PICKUP <span>·</span> MISSION 02</div>
        <h1>{carArrived ? <>მანქანა<br /><em>აქ არის.</em></> : <>დემე<br /><em>გზაშია.</em></>}</h1>
        <p>{carArrived ? nearCar ? 'მიუახლოვდი მარცხენა კარს და ჩაჯექი.' : 'მანქანასთან მიდი. ქუჩის კიდეზე გაჩერდა.' : 'ფარების შუქი უკვე ჩანს. დარჩი ტროტუარზე და დაელოდე.'}</p>
        <div className="arrival-card"><span className={`arrival-beacon ${carArrived ? 'is-arrived' : ''}`}><i /></span><div><small>{carArrived ? 'მანქანა გაჩერებულია' : 'მანქანა ქუჩაზე მოდის'}</small><b>{carArrived ? 'დემე · შენ გელოდება' : 'ვერა → შენამდე'}</b></div><span className="arrival-state">{carArrived ? 'HERE' : 'ETA'}</span></div>
        <button className="primary-button mission-action" onClick={onEnterCar} disabled={!carArrived || !nearCar}><span>{!carArrived ? 'მანქანა მოდის' : nearCar ? 'მანქანაში ჩაჯდომა' : 'მიუახლოვდი მანქანას'}</span><i>E</i></button>
        <div className="world-controls-label"><b>W A S D</b> მანქანამდე <span>·</span> <b>E</b> ჩაჯდომა</div>
      </>}
      {stage === 'drive' && <>
        <div className="mission-kicker"><i className={atRestaurant ? 'is-arrived' : ''} /> NIGHT DRIVE <span>·</span> MISSION 03</div>
        <h1>{atRestaurant ? <>ვერაში<br /><em>ჩავედით.</em></> : <>ქალაქის<br /><em>გულში.</em></>}</h1>
        <p>{atRestaurant ? 'დემემ მანქანა გააჩერა. ახლა შედით რესტორანში.' : 'დემე საჭესთანაა. განათებები გვიძღვება ჩვენს მაგიდამდე.'}</p>
        <div className="drive-meter"><div className="drive-meter-top"><span>მარშრუტი</span><b>საბურთალო <i>→</i> ვერა</b></div><div className="drive-route"><i style={{ width: `${Math.max(7, driveProgress * 100)}%` }} /><span className="car-pulse">◆</span><em /></div><div className="drive-meter-bottom"><span>თბილისი</span><span>{Math.round(driveProgress * 100)}%</span><span>~ 06 წთ</span></div></div>
        <button className="primary-button mission-action" onClick={onEnterRestaurant} disabled={!atRestaurant}><span>{atRestaurant ? 'რესტორანში შესვლა' : 'გზაში ვართ…'}</span><i>{atRestaurant ? 'E' : '·'}</i></button>
        <div className="world-controls-label"><b>ღამის მარშრუტი</b> <span>·</span> DEME DRIVING</div>
      </>}
      {stage === 'restaurant' && <>
        <div className="mission-kicker"><i className="is-arrived" /> {dateFinished ? 'DATE COMPLETE' : dinnerReady ? 'DINNER TABLE' : 'ARRIVAL'} <span>·</span> MISSION 04</div>
        <h1>{dateFinished ? <>რა კარგი<br /><em>საღამო იყო.</em></> : <>საღამო<br /><em>იწყება ახლა.</em></>}</h1>
        <p>{dateFinished ? endingLine : dinnerReady ? 'თქვენი შეკვეთა მოვიდა. მაგიდასთან საუბარი დაიწყეთ.' : 'დემე მაგიდამდე მიგიძღვება, ნინი კი უკან მიჰყვება.'}</p>
        <div className="dinner-order"><span className="dinner-order-icon">✳</span><div><small>ჩვენი შეკვეთა</small><b>{dish}<i> × </i>{beverage}</b><span>შენ აირჩიე. დემემ დაიმახსოვრა.</span></div><span className="order-heart">♥</span></div>
        {dateFinished && <div className="date-score-summary"><span>საღამოს განწყობა</span><b>{Math.round(dateScore / 9 * 100)}%</b><i><em style={{ width: `${Math.round(dateScore / 9 * 100)}%` }} /></i></div>}
        <button className="primary-button mission-action" onClick={onRestart}><span>თავიდან თამაში</span><i>↻</i></button>
      </>}
    </aside>
  );
}

function MessageToast({ stage, carArrived, orderSent, food, drink }) {
  if (stage === 'opening') return <div className="scene-notice"><i>☏</i><span>დემე <small>„ნინი, დღეს საღამოს ჩემთან ერთად წამოხვალ?“</small></span><b>ახლა</b></div>;
  if (stage === 'pickup' && orderSent && !carArrived) {
    const dish = foodMenu.find((item) => item.id === food)?.name || 'შეკვეთა';
    const beverage = drinkMenu.find((item) => item.id === drink)?.name || 'სასმელი';
    return <div className="scene-notice scene-notice--arrived"><i>✉</i><span>შეკვეთა გაიგზავნა<small>{dish} · {beverage}</small></span><b>EMAIL</b></div>;
  }
  if (stage === 'pickup' && carArrived) return <div className="scene-notice scene-notice--arrived"><i>🚘</i><span>დემე <small>„ქუჩის მეორე მხარეს ვარ. გამოდი.“</small></span><b>HERE</b></div>;
  return null;
}

const dinnerDialogue = [
  {
    prompt: '„დღეს საღამოს შენთან ერთად ყოფნა ყველაზე მეტად მიხარია.“',
    answers: [
      { text: 'შენთან ერთად ქალაქიც სხვანაირია.', points: 3 },
      { text: 'ადგილი მართლა ძალიან ლამაზია.', points: 2 },
      { text: 'მოდი, ჯერ ჩვენი შეკვეთა გავსინჯოთ.', points: 1 },
    ],
  },
  {
    prompt: '„დესერტის შემდეგ სად წავიდეთ?“',
    answers: [
      { text: 'მტკვრის სანაპიროზე გავისეირნოთ.', points: 3 },
      { text: 'ძველი თბილისის ქუჩები ვნახოთ.', points: 2 },
      { text: 'მანქანით ცოტა კიდევ ვიაროთ.', points: 1 },
    ],
  },
  {
    prompt: '„ეს საღამო კიდევ გავიმეოროთ?“',
    answers: [
      { text: 'აუცილებლად. შემდეგ ჯერზე მე დავგეგმავ.', points: 3 },
      { text: 'კი, უკვე მაქვს ერთი იდეა.', points: 2 },
      { text: 'დღევანდელი საღამო ჯერ ბოლომდე დავტკბეთ.', points: 1 },
    ],
  },
];

function DateDialogue({ step, score, onChoose, onClose }) {
  if (step < 0) return null;
  const ending = score >= 8
    ? 'დემემ გაიღიმა. ნინის პასუხმა საღამო სპონტანურ გასეირნებად გაგრძელებინა.'
    : score >= 5
      ? 'მათ კიდევ დიდხანს ისაუბრეს და შემდეგი შეხვედრის დღეც შეათანხმეს.'
      : 'საღამო მშვიდად დასრულდა — ორივემ იცოდა, რომ საუბარი ჯერ კიდევ გრძელდებოდა.';
  const current = dinnerDialogue[step];
  return (
    <section className={`date-dialogue ${step === 3 ? 'date-dialogue--ending' : ''}`} role="dialog" aria-label="დემესთან საუბარი">
      <div className="date-dialogue-head"><span className="dialogue-avatar">დ</span><div><b>{step === 3 ? 'ერთი ლამაზი საღამო' : 'დემე'}</b><small>{step === 3 ? 'თქვენი ისტორია' : 'ვერას რესტორანი · ახლა'}</small></div><span className="dialogue-counter">{step === 3 ? 'END' : `0${step + 1} / 03`}</span></div>
      {step === 3 ? <>
        <div className="dialogue-ending-mark">✦</div>
        <p className="dialogue-ending-copy">{ending}</p>
        <div className="dialogue-score"><span>საღამოს ქიმია</span><b>{Math.round(score / 9 * 100)}%</b><i><em style={{ width: `${Math.round(score / 9 * 100)}%` }} /></i></div>
        <button className="dialogue-close" onClick={onClose}>საღამოს გაგრძელება <span>↗</span></button>
      </> : <>
        <p className="dialogue-prompt">{current.prompt}</p>
        <div className="dialogue-answers">{current.answers.map((answer, index) => (
          <button key={answer.text} onClick={() => onChoose(answer.points)}><kbd>{index + 1}</kbd><span>{answer.text}</span><i>↗</i></button>
        ))}</div>
        <div className="dialogue-progress"><span>თქვენი საღამოს განწყობა</span><i><em style={{ width: `${Math.min(100, score / 9 * 100)}%` }} /></i></div>
      </>}
    </section>
  );
}

function InteractionPrompt({ stage, dinnerReady, dateFinished, dialogueStep, onStart }) {
  if (stage !== 'restaurant' || !dinnerReady || dateFinished || dialogueStep >= 0) return null;
  return <button className="interaction-prompt" onClick={onStart}><span className="interaction-key">E</span><span><b>საუბარი დაიწყე</b><small>დემე მაგიდასთან გელოდება</small></span><i>↗</i></button>;
}

function TouchControls({ stage, nearCar, carArrived, atRestaurant, controlsRef, onOpenPhone, onEnterCar, onEnterRestaurant }) {
  const stickRef = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const update = (event) => {
    const rect = stickRef.current?.getBoundingClientRect();
    if (!rect) return;
    const radius = rect.width * 0.34;
    let x = (event.clientX - (rect.left + rect.width / 2)) / radius;
    let y = (event.clientY - (rect.top + rect.height / 2)) / radius;
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }
    setKnob({ x: x * radius, y: y * radius });
    controlsRef.current = { ...controlsRef.current, x, z: y };
  };
  const stop = () => { setKnob({ x: 0, y: 0 }); controlsRef.current = { ...controlsRef.current, x: 0, z: 0 }; };
  const holdDriveControl = (event, control, value) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    controlsRef.current = { ...controlsRef.current, [control]: value };
  };
  const releaseDriveControl = (event, control) => {
    controlsRef.current = { ...controlsRef.current, [control]: false };
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const action = stage === 'opening' ? onOpenPhone : stage === 'pickup' ? onEnterCar : stage === 'drive' ? onEnterRestaurant : undefined;
  const disabled = stage === 'pickup' ? !carArrived || !nearCar : stage === 'drive' ? !atRestaurant : !action;
  const label = stage === 'opening' ? 'ტელეფონი' : stage === 'pickup' ? nearCar ? 'ჩაჯდომა' : 'მიდი მანქანამდე' : stage === 'drive' ? 'შესვლა' : '—';
  if (stage === 'restaurant') return null;
  return (
    <div className={`touch-controls ${stage === 'drive' ? 'touch-controls--drive' : ''}`}>
      <div className="virtual-stick" ref={stickRef} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); update(event); }} onPointerMove={(event) => { if (event.buttons) update(event); }} onPointerUp={stop} onPointerCancel={stop} aria-label="მოძრაობის ჯოისტიკი">
        <span className="stick-ring" /><i className="stick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} /><b>MOVE</b>
      </div>
      <span className="touch-camera-hint">↔ თითით კამერის მობრუნება</span>
      {stage === 'drive' && <div className="drive-pedals">
        <button className="ride-pedal ride-pedal--brake" onPointerDown={(event) => holdDriveControl(event, 'brake', true)} onPointerUp={(event) => releaseDriveControl(event, 'brake')} onPointerCancel={(event) => releaseDriveControl(event, 'brake')} onPointerLeave={(event) => releaseDriveControl(event, 'brake')}><span>▼</span><b>შენელება</b></button>
        <button className="ride-pedal ride-pedal--gas" onPointerDown={(event) => holdDriveControl(event, 'accelerate', true)} onPointerUp={(event) => releaseDriveControl(event, 'accelerate')} onPointerCancel={(event) => releaseDriveControl(event, 'accelerate')} onPointerLeave={(event) => releaseDriveControl(event, 'accelerate')}><span>▲</span><b>გაზი</b></button>
      </div>}
      <button className="touch-action" disabled={disabled} onClick={action}><span>{stage === 'opening' ? '▣' : stage === 'pickup' ? 'E' : '↗'}</span>{label}</button>
    </div>
  );
}

function RotatePrompt({ onRotate }) {
  return (
    <div className="rotate-prompt">
      <div className="rotate-orbit"><div className="rotate-phone"><span /><i>✳</i></div><b>↻</b></div>
      <span className="rotate-kicker">პატარა რჩევა</span><h2>მოაბრუნე<br /><em>შენი საღამო.</em></h2>
      <p>შემოაბრუნე ტელეფონი ან ჩართე ჰორიზონტალური რეჟიმი,<br />რომ ქალაქი მთელ ეკრანზე გაიშალოს.</p>
      <button onClick={onRotate}>ჰორიზონტალურად გახსნა <span>↗</span></button>
    </div>
  );
}

export default function GameApp() {
  const [stage, setStage] = useState('opening');
  const [phoneView, setPhoneView] = useState('lock');
  const [food, setFood] = useState('');
  const [drink, setDrink] = useState('');
  const [time, setTime] = useState(getTime());
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [portraitOverride, setPortraitOverride] = useState(false);
  const [carArrived, setCarArrived] = useState(false);
  const [nearCar, setNearCar] = useState(false);
  const [atRestaurant, setAtRestaurant] = useState(false);
  const [driveProgress, setDriveProgress] = useState(0);
  const [dinnerReady, setDinnerReady] = useState(false);
  const [dialogueStep, setDialogueStep] = useState(-1);
  const [dialogueScore, setDialogueScore] = useState(0);
  const [dateFinished, setDateFinished] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ state: 'idle', message: '' });
  const [orderSent, setOrderSent] = useState(false);
  const [position, setPosition] = useState({ x: -5.85, z: 4.3 });
  const controlsRef = useRef({ x: 0, z: 0 });
  const audioRef = useRef(null);

  useEffect(() => {
    const clock = window.setInterval(() => setTime(getTime()), 30000);
    const full = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', full);
    return () => {
      window.clearInterval(clock);
      document.removeEventListener('fullscreenchange', full);
      if (audioRef.current) audioRef.current.context.close();
    };
  }, []);

  useEffect(() => {
    const chooseByNumber = (event) => {
      if (stage !== 'restaurant' || dialogueStep < 0 || dialogueStep > 2 || event.repeat) return;
      const answerIndex = Number(event.key) - 1;
      const answer = dinnerDialogue[dialogueStep]?.answers[answerIndex];
      if (!answer) return;
      setDialogueScore((score) => score + answer.points);
      setDialogueStep((step) => step >= 2 ? 3 : step + 1);
    };
    window.addEventListener('keydown', chooseByNumber);
    return () => window.removeEventListener('keydown', chooseByNumber);
  }, [stage, dialogueStep]);

  const toggleSound = () => {
    if (muted) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const context = new AudioContextClass();
        const master = context.createGain();
        const filter = context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 420;
        master.gain.setValueAtTime(0.0001, context.currentTime);
        master.gain.exponentialRampToValueAtTime(0.032, context.currentTime + 1.2);
        filter.connect(master);
        master.connect(context.destination);
        [55, 82.41, 110].forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          const voice = context.createGain();
          oscillator.type = index === 1 ? 'triangle' : 'sine';
          oscillator.frequency.value = frequency;
          oscillator.detune.value = index === 2 ? 4 : -2;
          voice.gain.value = [0.38, 0.21, 0.1][index];
          oscillator.connect(voice);
          voice.connect(filter);
          oscillator.start();
        });

        // A small procedural ambience loop keeps the city present without shipping audio assets.
        const noiseBuffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let index = 0; index < noiseData.length; index += 1) {
          noiseData[index] = (Math.random() * 2 - 1) * 0.22;
        }
        const cityNoise = context.createBufferSource();
        cityNoise.buffer = noiseBuffer;
        cityNoise.loop = true;

        const distantTraffic = context.createBiquadFilter();
        distantTraffic.type = 'bandpass';
        distantTraffic.frequency.value = 360;
        distantTraffic.Q.value = 0.45;
        const trafficGain = context.createGain();
        trafficGain.gain.value = 0.055;
        const passingLfo = context.createOscillator();
        const passingDepth = context.createGain();
        passingLfo.frequency.value = 0.11;
        passingDepth.gain.value = 0.038;
        passingLfo.connect(passingDepth);
        passingDepth.connect(trafficGain.gain);
        cityNoise.connect(distantTraffic);
        distantTraffic.connect(trafficGain);
        trafficGain.connect(master);
        passingLfo.start();

        const cityAir = context.createBiquadFilter();
        cityAir.type = 'lowpass';
        cityAir.frequency.value = 1150;
        const airGain = context.createGain();
        airGain.gain.value = 0.018;
        cityNoise.connect(cityAir);
        cityAir.connect(airGain);
        airGain.connect(master);
        cityNoise.start();
        context.resume();
        audioRef.current = { context, master };
      }
      setMuted(false);
    } else {
      if (audioRef.current) {
        const audio = audioRef.current;
        audio.master.gain.cancelScheduledValues(audio.context.currentTime);
        audio.master.gain.setTargetAtTime(0.0001, audio.context.currentTime, 0.18);
        window.setTimeout(() => audio.context.close(), 1000);
        audioRef.current = null;
      }
      setMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        window.screen.orientation?.unlock?.();
      } else {
        await document.documentElement.requestFullscreen?.();
        await window.screen.orientation?.lock?.('landscape');
      }
    } catch {
      // The embedded preview can refuse browser fullscreen; the game still fills the viewport.
    }
  };

  const rotateScreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
      await window.screen.orientation?.lock?.('landscape');
    } catch {
      // Physical device rotation still works when the browser does not support orientation locking.
    }
    setPortraitOverride(true);
  };

  const openPhone = () => { setPhoneView('lock'); setStage('phone'); };
  const startPickup = (sentByEmail) => {
    setCarArrived(false);
    setNearCar(false);
    setDinnerReady(false);
    setDialogueStep(-1);
    setDialogueScore(0);
    setDateFinished(false);
    setOrderSent(sentByEmail);
    setStage('pickup');
  };
  const acceptInvite = async () => {
    const selectedFood = foodMenu.find((item) => item.id === food);
    const selectedDrink = drinkMenu.find((item) => item.id === drink);
    if (!selectedFood || !selectedDrink || emailStatus.state === 'sending') return;
    if (!/^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/i.test(formspreeEndpoint)) {
      setEmailStatus({ state: 'missing', message: 'Formspree endpoint არასწორია ან დაყენებული არ არის.' });
      return;
    }

    setEmailStatus({ state: 'sending', message: 'შეკვეთა ელფოსტაზე იგზავნება…' });
    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: 'ერთი საღამო — ნინის შეკვეთა',
          name: 'ნინი',
          food: selectedFood.name,
          food_price: selectedFood.tag.split('·').pop()?.trim() || '',
          drink: selectedDrink.name,
          order: `${selectedFood.name} + ${selectedDrink.name}`,
          submitted_at: new Date().toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi' }),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const formError = result.errors?.map((item) => item.message).filter(Boolean).join(' ');
        throw new Error(formError || `Formspree ${response.status}`);
      }
      setEmailStatus({ state: 'success', message: 'შეკვეთა ელფოსტაზე გაიგზავნა.' });
      startPickup(true);
    } catch {
      setEmailStatus({ state: 'error', message: 'გაგზავნა ვერ მოხერხდა. endpoint შეამოწმე და თავიდან სცადე.' });
    }
  };
  const enterCar = () => {
    if (carArrived && nearCar) {
      setDriveProgress(0);
      setAtRestaurant(false);
      setStage('drive');
    }
  };
  const enterRestaurant = () => {
    if (!atRestaurant) return;
    setDinnerReady(false);
    setDialogueStep(-1);
    setDialogueScore(0);
    setDateFinished(false);
    setStage('restaurant');
  };
  const startConversation = () => {
    if (!dinnerReady || dateFinished || dialogueStep >= 0) return;
    setDialogueScore(0);
    setDialogueStep(0);
  };
  const chooseConversation = (points) => {
    setDialogueScore((score) => score + points);
    setDialogueStep((step) => step >= 2 ? 3 : step + 1);
  };
  const closeConversation = () => {
    setDialogueStep(-1);
    setDateFinished(true);
  };
  const restart = () => {
    setPhoneView('lock');
    setFood('');
    setDrink('');
    setCarArrived(false);
    setNearCar(false);
    setAtRestaurant(false);
    setDriveProgress(0);
    setDinnerReady(false);
    setDialogueStep(-1);
    setDialogueScore(0);
    setDateFinished(false);
    setEmailStatus({ state: 'idle', message: '' });
    setOrderSent(false);
    setStage('opening');
  };
  const action = stage === 'opening' ? openPhone : stage === 'pickup' ? enterCar : stage === 'drive' ? enterRestaurant : undefined;

  return (
    <div className={`app-shell stage-${stage} ${portraitOverride ? 'portrait-continued' : ''}`}>
      <GameScene
        stage={stage}
        controlsRef={controlsRef}
        onPhoneRequest={openPhone}
        onEnterCar={enterCar}
        onCarArrived={setCarArrived}
        onNearCarChange={setNearCar}
        onDriveProgress={setDriveProgress}
        onRestaurantReached={setAtRestaurant}
        onEnterRestaurant={enterRestaurant}
        onPlayerPosition={setPosition}
        onDinnerReady={setDinnerReady}
        onDinnerInteract={startConversation}
      />
      {stage === 'phone' ? (
        <PhoneWorld view={phoneView} time={time} food={food} drink={drink} setFood={(value) => { setFood(value); setEmailStatus({ state: 'idle', message: '' }); }} setDrink={(value) => { setDrink(value); setEmailStatus({ state: 'idle', message: '' }); }} fullscreen={fullscreen} onFullscreen={toggleFullscreen} onAccept={acceptInvite} onContinueWithoutEmail={() => startPickup(false)} emailConfigured={/^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/i.test(formspreeEndpoint)} emailStatus={emailStatus} onUnlock={() => setPhoneView('home')} onOpenMessages={() => setPhoneView('messages')} onHome={() => setPhoneView('home')} />
      ) : <>
        <Header time={time} muted={muted} fullscreen={fullscreen} onSound={toggleSound} onFullscreen={toggleFullscreen} />
        <MissionPanel stage={stage} food={food} drink={drink} carArrived={carArrived} nearCar={nearCar} atRestaurant={atRestaurant} dinnerReady={dinnerReady} dateFinished={dateFinished} dateScore={dialogueScore} driveProgress={driveProgress} onOpenPhone={openPhone} onEnterCar={enterCar} onEnterRestaurant={enterRestaurant} onRestart={restart} />
        <MessageToast stage={stage} carArrived={carArrived} orderSent={orderSent} food={food} drink={drink} />
        <MiniMap position={position} stage={stage} carArrived={carArrived} nearCar={nearCar} driveProgress={driveProgress} dinnerReady={dinnerReady} dateFinished={dateFinished} />
        <ProgressHUD stage={stage} />
        <div className="desktop-controls"><span><b>W A S D</b> სიარული</span><span><b>SHIFT</b> სირბილი</span><span><b>DRAG</b> ხედის მობრუნება</span><span><b>F</b> ტელეფონი</span><span><b>E</b> ჩაჯდომა / შესვლა / საუბარი</span>{stage === 'drive' && <span><b>W / S</b> გაზი / შენელება</span>}</div>
        <TouchControls stage={stage} nearCar={nearCar} carArrived={carArrived} atRestaurant={atRestaurant} controlsRef={controlsRef} onOpenPhone={openPhone} onEnterCar={enterCar} onEnterRestaurant={enterRestaurant} />
        <InteractionPrompt stage={stage} dinnerReady={dinnerReady} dateFinished={dateFinished} dialogueStep={dialogueStep} onStart={startConversation} />
        <DateDialogue step={dialogueStep} score={dialogueScore} onChoose={chooseConversation} onClose={closeConversation} />
      </>}
      <div className="portrait-veil"><RotatePrompt onRotate={rotateScreen} /></div>
      {portraitOverride && <button className="portrait-tip" onClick={rotateScreen}>↻ ჰორიზონტალური რეჟიმი</button>}
    </div>
  );
}
