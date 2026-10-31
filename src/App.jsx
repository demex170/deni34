import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Scene from './Scene.jsx';

const stages = [
  { id: 'opening', title: 'შეტყობინება', tiny: 'MESSAGE' },
  { id: 'phone', title: 'არჩევანი', tiny: 'YOUR PICK' },
  { id: 'pickup', title: 'მოსვლა', tiny: 'PICKUP' },
  { id: 'drive', title: 'გზა', tiny: 'THE RIDE' },
  { id: 'restaurant', title: 'ვახშამი', tiny: 'DINNER' },
];

const foodMenu = [
  { id: 'pasta', icon: '🍝', name: 'პასტა', note: 'კრემოვანი კარბონარა', tag: 'ITALIAN · ₾32' },
  { id: 'sushi', icon: '🍣', name: 'სუში', note: 'შეფის სეტი · 12 ნაჭერი', tag: 'JAPANESE · ₾48' },
  { id: 'pizza', icon: '🍕', name: 'პიცა', note: 'ტრიუფელი · მოცარელა', tag: 'ITALIAN · ₾36' },
  { id: 'khinkali', icon: '🥟', name: 'ხინკალი', note: 'ქალაქური · შავი პილპილი', tag: 'GEORGIAN · ₾24' },
  { id: 'ramen', icon: '🍜', name: 'რამენი', note: 'მისო · ნაზი ბულიონი', tag: 'JAPANESE · ₾34' },
  { id: 'salad', icon: '🥗', name: 'სალათი', note: 'ბურატა · ატამი · ბაზილიკი', tag: 'FRESH · ₾28' },
];

const drinkMenu = [
  { id: 'lemonade', icon: '🍋', name: 'ლიმონათი', note: 'ციტრუსი · როზმარინი' },
  { id: 'iced-tea', icon: '🧋', name: 'ცივი ჩაი', note: 'ატამი · ჟასმინი' },
  { id: 'matcha', icon: '🍵', name: 'მატჩა', note: 'მწვანე · ნუშის რძე' },
  { id: 'coffee', icon: '☕', name: 'ყავა', note: 'ფილტრი · შოკოლადის ნოტი' },
  { id: 'tonic', icon: '🥤', name: 'ტონიკი', note: 'გრეიფრუტი · რეჰანი' },
  { id: 'mocktail', icon: '🍹', name: 'მოქტეილი', note: 'მარწყვი · ვარდის წყალი' },
];

function formatTime() {
  return new Intl.DateTimeFormat('ka-GE', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tbilisi' }).format(new Date());
}

function HudHeader({ time, muted, isFullscreen, onToggleSound, onToggleFullscreen }) {
  return (
    <header className="hud-header">
      <div className="brand-lockup">
        <span className="brand-mark">D<span>×</span>N</span>
        <span className="brand-caption">ერთი საღამო<br /><i>პირადი ამბავი</i></span>
      </div>
      <div className="header-center"><span className="live-dot" /> ღამის ჩანაწერი <span className="header-divider">/</span> <span>თბილისი · {time}</span></div>
      <div className="header-actions">
        <button className="sound-button" onClick={onToggleSound} aria-label={muted ? 'ხმის ჩართვა' : 'ხმის გამორთვა'}>
          <span className={`sound-bars ${muted ? 'is-muted' : ''}`}><i /><i /><i /><i /></span>
          {muted ? 'ხმა გამორთულია' : 'ღამის ხმა'}
        </button>
        <button className="fullscreen-button" onClick={onToggleFullscreen} aria-label={isFullscreen ? 'სრული ეკრანიდან გამოსვლა' : 'სრულ ეკრანზე გადასვლა'} title="სრული ეკრანი">{isFullscreen ? '⛶' : '⛶'}</button>
      </div>
    </header>
  );
}

function StageRail({ stage, unlocked, onNavigate }) {
  const current = stages.findIndex((item) => item.id === stage);
  return (
    <nav className="stage-rail" aria-label="ისტორიის ეტაპები">
      <div className="rail-caption"><span>საღამოს მარშრუტი</span><span>0{current + 1} / 05</span></div>
      <div className="rail-line" aria-hidden="true"><i style={{ width: `${(current / (stages.length - 1)) * 100}%` }} /></div>
      <div className="rail-steps">
        {stages.map((item, index) => {
          const passed = index < current;
          const available = index <= unlocked;
          return (
            <button
              className={`rail-step ${index === current ? 'is-current' : ''} ${passed ? 'is-passed' : ''} ${!available ? 'is-locked' : ''}`}
              key={item.id}
              onClick={() => available && onNavigate(item.id)}
              disabled={!available}
              aria-current={index === current ? 'step' : undefined}
            >
              <span className="step-dot">{passed ? '✓' : `0${index + 1}`}</span>
              <span className="step-text"><b>{item.title}</b><small>{item.tiny}</small></span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function IntroCopy({ onOpen }) {
  return (
    <section className="story-panel intro-copy">
      <div className="eyebrow"><span className="eyebrow-rule" /> <span>მოწვევა · 01.01</span> <span className="eyebrow-dot">●</span> <span>მხოლოდ შენთვის</span></div>
      <h1>დღეს ღამე,<br /><em>ჩვენ ორნი.</em></h1>
      <p className="story-lead">ზოგი საღამო იწყება ერთი შეტყობინებით.<br />ეს საღამო — შენით იწყება.</p>
      <div className="invitation-card"><span className="invitation-index">01</span><div><small>ღამის ჩანაწერი</small><b>დემე <i>×</i> ნინი</b><span>თბილისი · 21:14</span></div><i className="invitation-spark">✳</i></div>
      <button className="primary-button" onClick={onOpen}><span>ტელეფონის აღება</span><i>↗</i></button>
      <p className="micro-hint">ხელი მიაწვდინე ეკრანს <span>✳</span></p>
      <div className="side-index">01 <span>—</span> 05</div>
    </section>
  );
}

function ChoiceCard({ item, selected, onClick, kind }) {
  return (
    <button className={`choice-card choice-card--${kind} ${selected ? 'is-selected' : ''}`} onClick={onClick} aria-pressed={selected}>
      <span className="choice-icon">{item.icon}</span>
      <span className="choice-copy"><b>{item.name}</b><small>{item.note}</small>{item.tag && <i>{item.tag}</i>}</span>
      <span className="choice-check">{selected ? '✓' : '＋'}</span>
    </button>
  );
}

function PhoneWorld({ food, drink, setFood, setDrink, isFullscreen, onToggleFullscreen, onAccept, onBack }) {
  const selectedFood = foodMenu.find((item) => item.id === food);
  const selectedDrink = drinkMenu.find((item) => item.id === drink);
  return (
    <div className="phone-world">
      <div className="phone-topline"><span>21:14 <b>◔ ◔ ▰</b></span><span className="phone-island" /><span>●●●● <b>87%</b></span></div>
      <div className="phone-header">
        <button className="phone-back" onClick={onBack} aria-label="უკან">←</button>
        <span className="deme-avatar">დ</span>
        <div><b>დემე</b><small><i /> ონლაინ · შენთვის გეგმავს საღამოს</small></div>
        <span className="header-stars">✳</span>
        <button className="fullscreen-button phone-fullscreen" onClick={onToggleFullscreen} aria-label={isFullscreen ? 'სრული ეკრანიდან გამოსვლა' : 'სრულ ეკრანზე გადასვლა'}>⛶</button>
      </div>
      <div className="phone-body">
        <section className="message-column">
          <div className="message-date">დღეს · 21:14</div>
          <div className="message-bubble"><small>დემე</small><p>ნინი, დღეს საღამოს შენთან ერთად გასვლა მინდა. წამოხვალ?</p><span>21:14 ✓✓</span></div>
          <div className="invite-note"><i>✳</i><span>შენი პასუხი საღამოს გეგმას<br />მშვენივრად დაასრულებს.</span></div>
          <div className="order-recap"><small>შენი არჩევანი</small><b>{selectedFood?.name || 'საჭმელი'} <span>·</span> {selectedDrink?.name || 'სასმელი'}</b><i>დემეს პირდაპირ გაეგზავნება</i></div>
        </section>
        <section className="choice-column">
          <div className="choice-heading"><div><span className="eyebrow-small">შენ გადაწყვიტე</span><h2>რას შევუკვეთოთ?</h2></div><span className="choice-step">01 <i>/</i> 02</span></div>
          <p className="choice-label">საჭმელი <span>ერთი აირჩიე</span></p>
          <div className="choice-grid">
            {foodMenu.map((item) => <ChoiceCard key={item.id} item={item} kind="food" selected={food === item.id} onClick={() => setFood(item.id)} />)}
          </div>
          <div className="drink-heading"><p className="choice-label">სასმელი <span>კიდევ ერთი</span></p><span className="mini-spark">✳</span></div>
          <div className="drink-grid">
            {drinkMenu.map((item) => <ChoiceCard key={item.id} item={item} kind="drink" selected={drink === item.id} onClick={() => setDrink(item.id)} />)}
          </div>
          <div className="send-row"><button className="primary-button send-button" onClick={onAccept} disabled={!food || !drink}><span>კი, წავიდეთ</span><i>↗</i></button><span>ერთი ლამაზი საღამო<br />სულ ახლოსაა.</span></div>
        </section>
      </div>
      <div className="phone-home-indicator" />
      <div className="phone-watermark">D × N <span>YOUR EVENING BEGINS HERE</span></div>
    </div>
  );
}

function SceneCopy({ stage, food, drink, onPickup, onDrive, onDinner, onRestart }) {
  const dish = foodMenu.find((item) => item.id === food)?.name ?? 'შენი არჩევანი';
  const beverage = drinkMenu.find((item) => item.id === drink)?.name ?? 'სასმელი';
  if (stage === 'pickup') return (
    <section className="story-panel journey-copy">
      <div className="eyebrow"><span className="eyebrow-rule" /> <span>მოსვლის დროა · 03.05</span></div>
      <h1>ფარები<br /><em>უკვე ჩანს.</em></h1>
      <p className="story-lead">დემე ქვემოთ გელოდება.<br />მანქანა უკვე გაჩერდა — საღამო მზადაა.</p>
      <div className="ride-card"><span className="ride-sigil">↗</span><div><small>შენი მძღოლი</small><b>დემე <i>•</i> გზაზეა</b><span>თბილისი · ღამის მარშრუტი</span></div><div className="ride-arrival"><b>02</b><small>წთ</small></div></div>
      <button className="primary-button" onClick={onPickup}><span>მანქანაში ჩაჯდომა</span><i>↗</i></button>
      <p className="micro-hint">შენი ადგილისთვის კარი ღიაა <span>✳</span></p>
      <div className="journey-coordinates">41°42′N <span>·</span> 44°47′E</div>
    </section>
  );
  if (stage === 'drive') return (
    <section className="story-panel journey-copy">
      <div className="eyebrow"><span className="eyebrow-rule" /> <span>ღამის გასეირნება · 04.05</span></div>
      <h1>ქალაქი<br /><em>ჩვენია.</em></h1>
      <p className="story-lead">ფანჯრის მიღმა განათებები მიედინება,<br />ხოლო ჩვენი მაგიდა უკვე მზადაა.</p>
      <div className="drive-meter"><div className="drive-meter-top"><span>გზაში ვართ</span><b>საბურთალო <i>→</i> ვერა</b></div><div className="drive-route"><i /><span className="car-pulse">◆</span><em /></div><div className="drive-meter-bottom"><span>3.8 კმ</span><span>~ 06 წუთი</span><span>თბილისი, საქართველო</span></div></div>
      <button className="primary-button" onClick={onDrive}><span>რესტორანში ჩასვლა</span><i>↗</i></button>
      <p className="micro-hint">ფანჯარა ოდნავ ჩამოწიე <span>✳</span></p>
      <div className="journey-coordinates">NIGHT DRIVE <span>·</span> 22:03</div>
    </section>
  );
  return (
    <section className="story-panel dinner-copy">
      <div className="eyebrow"><span className="eyebrow-rule" /> <span>ჩვენი მაგიდა · 05.05</span> <span className="eyebrow-dot">●</span> <span>საღამო იწყება</span></div>
      <h1>ერთი მაგიდა,<br /><em>ორი ამბავი.</em></h1>
      <p className="story-lead">საღამო მშვიდად ჩამოჯდა ჩვენთან.<br />დანარჩენი — შენით.</p>
      <div className="dinner-order"><span className="dinner-order-icon">✳</span><div><small>ჩვენი შეკვეთა</small><b>{dish}<i> × </i>{beverage}</b><span>შენ აირჩიე. დემემ დაიმახსოვრა.</span></div><span className="order-heart">♥</span></div>
      <div className="ending-line"><span /> <i>21:14 → ∞</i></div>
      <button className="primary-button" onClick={onRestart}><span>კიდევ ერთხელ გავიაროთ</span><i>↻</i></button>
      <p className="micro-hint">საუკეთესო საღამოები გრძელდება <span>✳</span></p>
      <div className="journey-coordinates">SOMEWHERE IN TBILISI <span>·</span> 22:14</div>
    </section>
  );
}

function RotatePrompt({ onContinue }) {
  return (
    <div className="rotate-prompt">
      <div className="rotate-orbit"><div className="rotate-phone"><span /><i>✳</i></div><b>↻</b></div>
      <span className="rotate-kicker">პატარა რჩევა</span>
      <h2>მოაბრუნე<br /><em>შენი საღამო.</em></h2>
      <p>გადაატრიალე ტელეფონი ჰორიზონტალურად,<br />რომ ეს ამბავი მთელ ეკრანზე გაიშალოს.</p>
      <button onClick={onContinue}>ასეც გავაგრძელოთ <span>↗</span></button>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState('opening');
  const [unlocked, setUnlocked] = useState(0);
  const [food, setFood] = useState('');
  const [drink, setDrink] = useState('');
  const [time, setTime] = useState(formatTime());
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [portraitOverride, setPortraitOverride] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(formatTime()), 30000);
    return () => {
      window.clearInterval(timer);
      if (audioRef.current) audioRef.current.context.close();
    };
  }, []);

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => document.removeEventListener('fullscreenchange', updateFullscreen);
  }, []);

  useLayoutEffect(() => {
    const shell = document.querySelector('.app-shell');
    if (shell) shell.scrollTop = 0;
  }, [stage]);

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
        master.gain.exponentialRampToValueAtTime(0.024, context.currentTime + 1.2);
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
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen?.();
    } catch {
      // Fullscreen can be unavailable in embedded browsers; the scene still fills the viewport.
    }
  };

  const openPhone = () => {
    setUnlocked(1);
    setStage('phone');
  };
  const acceptInvite = () => {
    setUnlocked(2);
    setStage('pickup');
  };
  const enterCar = () => {
    setUnlocked(3);
    setStage('drive');
  };
  const arrive = () => {
    setUnlocked(4);
    setStage('restaurant');
  };
  const restart = () => {
    setUnlocked(0);
    setFood('');
    setDrink('');
    setStage('opening');
  };
  const navigate = (next) => setStage(next);

  return (
    <div className={`app-shell stage-${stage} ${portraitOverride ? 'portrait-continued' : ''}`}>
      <div className="ambient-orb ambient-orb--one" /><div className="ambient-orb ambient-orb--two" />
      {stage === 'phone' ? <PhoneWorld food={food} drink={drink} setFood={setFood} setDrink={setDrink} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} onAccept={acceptInvite} onBack={() => setStage('opening')} /> : (
        <>
          <HudHeader time={time} muted={muted} isFullscreen={isFullscreen} onToggleSound={toggleSound} onToggleFullscreen={toggleFullscreen} />
          <main className="story-stage">
            {stage === 'opening' ? <IntroCopy onOpen={openPhone} /> : <SceneCopy stage={stage} food={food} drink={drink} onPickup={enterCar} onDrive={arrive} onRestart={restart} />}
            <section className="visual-stage" aria-label="სამგანზომილებიანი სცენა">
              <Scene stage={stage} />
              <div className="scene-topline"><span><i /> THREE.JS SCENE</span><span>{stages.find((item) => item.id === stage)?.tiny} <i>·</i> LIVE RENDER</span></div>
              <div className="scene-corner scene-corner--tl" /><div className="scene-corner scene-corner--br" />
              <div className="scene-coordinate scene-coordinate--left">41°42′ N<br /><i>44°47′ E</i></div>
              <div className="scene-coordinate scene-coordinate--right"><span>NO.</span>0{stages.findIndex((item) => item.id === stage) + 1}<br /><i>თბილისი · ღამე</i></div>
              {stage === 'opening' && <div className="scene-notice"><i>☏</i><span>დემე <small>„ნინი, დღეს საღამოს ჩემთან ერთად წამოხვალ?“</small></span><b>ახლა</b></div>}
              {stage === 'pickup' && <div className="scene-scan"><span>ARRIVAL DETECTED</span><b>01:42 <i>→</i></b><small>დემე · ქუჩის მეორე მხარეს</small></div>}
              {stage === 'drive' && <div className="scene-scan scene-scan--drive"><span>LIVE ROUTE</span><b>22:03 <i>◆</i></b><small>ვერა · 3.8 კმ</small></div>}
              {stage === 'restaurant' && <div className="scene-scan scene-scan--table"><span>TABLE FOR TWO</span><b>02 <i>✳</i></b><small>ღამე ჯერ ახალი დაწყებულია</small></div>}
              <div className="scene-vertical-label">AN EVENING, MADE FOR TWO <i>✳</i></div>
            </section>
          </main>
          <footer className="hud-footer">
            <StageRail stage={stage} unlocked={unlocked} onNavigate={navigate} />
            <div className="footer-meta"><span><i className="footer-pulse" /> ისტორია მიმდინარეობს</span><span>საღამოს ჩანაწერი <b>№ 014</b></span><span>სურვილისამებრ <b>↗</b></span></div>
          </footer>
        </>
      )}
      <div className="portrait-veil"><RotatePrompt onContinue={() => setPortraitOverride(true)} /></div>
      {portraitOverride && <button className="portrait-tip" onClick={() => setPortraitOverride(false)}>↻ ჰორიზონტალურად ნახე</button>}
    </div>
  );
}
