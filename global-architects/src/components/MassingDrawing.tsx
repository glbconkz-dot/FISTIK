import type { ReactNode } from 'react';
import type { DrawingKind } from '@/lib/projects';

type Props = {
  kind: DrawingKind;
  className?: string;
  title?: string;
};

const ink = '#1a1916';
const paper = '#f3efe6';
const stone = '#cfc8bc';

function Grid() {
  return (
    <g opacity="0.28" stroke={ink} strokeWidth="0.4">
      {Array.from({ length: 17 }, (_, i) => (
        <line key={`v${i}`} x1={40 + i * 45} y1={24} x2={40 + i * 45} y2={476} />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`h${i}`} x1={24} y1={24 + i * 45} x2={776} y2={24 + i * 45} />
      ))}
    </g>
  );
}

function Frame({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <svg
      viewBox="0 0 800 500"
      role="img"
      aria-label={title ?? 'Architectural drawing'}
      className="h-full w-full"
    >
      <rect width="800" height="500" fill={paper} />
      <Grid />
      <rect x="18" y="18" width="764" height="464" fill="none" stroke={ink} strokeWidth="0.8" />
      {children}
      <g fill="none" stroke={ink} strokeWidth="0.9">
        <polygon points="740,42 740,62 752,52" fill={ink} />
        <line x1="740" y1="62" x2="740" y2="78" />
      </g>
      <text x="732" y="92" fill={ink} fontSize="9" letterSpacing="1.6" fontFamily="ui-sans-serif, system-ui">
        N
      </text>
    </svg>
  );
}

function WarehouseCampus() {
  return (
    <>
      <rect x="90" y="210" width="430" height="150" fill="none" stroke={ink} strokeWidth="1.4" />
      <line x1="90" y1="260" x2="520" y2="260" stroke={ink} strokeWidth="0.7" />
      <line x1="90" y1="310" x2="520" y2="310" stroke={ink} strokeWidth="0.7" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={130 + i * 48} y1="210" x2={130 + i * 48} y2="360" stroke={ink} strokeWidth="0.6" />
      ))}
      <rect x="540" y="180" width="150" height="180" fill="none" stroke={ink} strokeWidth="1.5" />
      <line x1="540" y1="240" x2="690" y2="240" stroke={ink} strokeWidth="0.8" />
      <line x1="540" y1="300" x2="690" y2="300" stroke={ink} strokeWidth="0.8" />
      <rect x="90" y="150" width="70" height="40" fill="none" stroke={ink} strokeWidth="0.9" />
      <rect x="90" y="380" width="600" height="36" fill="none" stroke={ink} strokeDasharray="4 3" strokeWidth="0.8" />
      <text x="100" y="140" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        WAREHOUSE HALL
      </text>
      <text x="552" y="168" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        ADMIN
      </text>
    </>
  );
}

function ServiceYard() {
  return (
    <>
      <rect x="80" y="120" width="240" height="280" fill="none" stroke={ink} strokeWidth="1.4" />
      <rect x="360" y="160" width="280" height="200" fill="none" stroke={ink} strokeWidth="1.4" />
      <rect x="250" y="200" width="90" height="120" fill={stone} stroke={ink} strokeWidth="1" />
      <line x1="80" y1="190" x2="320" y2="190" stroke={ink} strokeWidth="0.7" />
      <line x1="80" y1="260" x2="320" y2="260" stroke={ink} strokeWidth="0.7" />
      <line x1="80" y1="330" x2="320" y2="330" stroke={ink} strokeWidth="0.7" />
      {Array.from({ length: 5 }, (_, i) => (
        <rect
          key={i}
          x={380 + i * 48}
          y="190"
          width="28"
          height="140"
          fill="none"
          stroke={ink}
          strokeWidth="0.8"
        />
      ))}
      <circle cx="200" cy="430" r="18" fill="none" stroke={ink} strokeWidth="0.9" />
      <text x="88" y="108" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        SHOP
      </text>
      <text x="368" y="148" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        YARD
      </text>
    </>
  );
}

function ClinicLowrise() {
  return (
    <>
      <rect x="110" y="180" width="560" height="160" fill="none" stroke={ink} strokeWidth="1.5" />
      <rect x="250" y="210" width="160" height="100" fill="none" stroke={ink} strokeWidth="1" />
      <line x1="110" y1="260" x2="670" y2="260" stroke={ink} strokeWidth="0.8" />
      {Array.from({ length: 14 }, (_, i) => (
        <rect
          key={i}
          x={130 + i * 38}
          y="190"
          width="18"
          height="28"
          fill="none"
          stroke={ink}
          strokeWidth="0.7"
        />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <rect
          key={`b${i}`}
          x={130 + i * 38}
          y="292"
          width="18"
          height="28"
          fill="none"
          stroke={ink}
          strokeWidth="0.7"
        />
      ))}
      <rect x="70" y="360" width="80" height="50" fill="none" stroke={ink} strokeWidth="0.9" />
      <text x="120" y="164" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        L1 DIAGNOSTICS / L2 CLINIC
      </text>
    </>
  );
}

function ClinicCampus() {
  return (
    <>
      <rect x="160" y="130" width="460" height="220" fill="none" stroke={ink} strokeWidth="1.6" />
      <rect x="160" y="350" width="460" height="70" fill="none" stroke={ink} strokeDasharray="5 4" strokeWidth="1" />
      <line x1="160" y1="200" x2="620" y2="200" stroke={ink} strokeWidth="0.8" />
      <line x1="160" y1="270" x2="620" y2="270" stroke={ink} strokeWidth="0.8" />
      <line x1="390" y1="130" x2="390" y2="350" stroke={ink} strokeWidth="0.9" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={180 + i * 46} y="148" width="24" height="36" fill="none" stroke={ink} strokeWidth="0.7" />
      ))}
      <text x="176" y="118" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        3F + PARKING
      </text>
      <text x="176" y="392" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        B1
      </text>
    </>
  );
}

function ResidentialTower() {
  return (
    <>
      <rect x="280" y="70" width="220" height="360" fill="none" stroke={ink} strokeWidth="1.6" />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          <line x1="280" y1={98 + i * 28} x2="500" y2={98 + i * 28} stroke={ink} strokeWidth="0.6" />
          <rect x="300" y={104 + i * 28} width="70" height="14" fill="none" stroke={ink} strokeWidth="0.7" />
          <rect x="410" y={104 + i * 28} width="70" height="14" fill="none" stroke={ink} strokeWidth="0.7" />
        </g>
      ))}
      <rect x="220" y="400" width="340" height="40" fill="none" stroke={ink} strokeWidth="1.1" />
      <text x="228" y="60" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        12 STOREYS
      </text>
    </>
  );
}

function ResidentialBlock() {
  return (
    <>
      <rect x="120" y="110" width="560" height="280" fill="none" stroke={ink} strokeWidth="1.6" />
      <rect x="200" y="170" width="400" height="160" fill={paper} stroke={ink} strokeWidth="1.1" />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`n${i}`} x1="120" y1={128 + i * 28} x2="200" y2={128 + i * 28} stroke={ink} strokeWidth="0.55" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`s${i}`} x1="600" y1={128 + i * 28} x2="680" y2={128 + i * 28} stroke={ink} strokeWidth="0.55" />
      ))}
      <circle cx="400" cy="250" r="28" fill="none" stroke={ink} strokeWidth="0.8" />
      <text x="128" y="98" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        9F COURTYARD
      </text>
    </>
  );
}

function OfficeBar() {
  return (
    <>
      <rect x="140" y="160" width="520" height="180" fill="none" stroke={ink} strokeWidth="1.5" />
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1="140" y1={200 + i * 36} x2="660" y2={200 + i * 36} stroke={ink} strokeWidth="0.7" />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={`w${i}`}
          x={160 + i * 40}
          y="172"
          width="22"
          height="16"
          fill="none"
          stroke={ink}
          strokeWidth="0.7"
        />
      ))}
      <rect x="140" y="360" width="90" height="40" fill="none" stroke={ink} strokeWidth="0.9" />
      <text x="148" y="146" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        4F BAR
      </text>
    </>
  );
}

function FactoryPlant() {
  return (
    <>
      <rect x="70" y="200" width="260" height="160" fill="none" stroke={ink} strokeWidth="1.4" />
      <rect x="350" y="220" width="180" height="140" fill="none" stroke={ink} strokeWidth="1.3" />
      <rect x="560" y="180" width="150" height="180" fill="none" stroke={ink} strokeWidth="1.3" />
      <circle cx="180" cy="150" r="42" fill="none" stroke={ink} strokeWidth="1.2" />
      <circle cx="250" cy="150" r="28" fill="none" stroke={ink} strokeWidth="1" />
      <rect x="70" y="380" width="120" height="50" fill="none" stroke={ink} strokeWidth="0.9" />
      <text x="78" y="122" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        TANK / WATER
      </text>
      <text x="80" y="192" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        PRODUCTION
      </text>
      <text x="572" y="168" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        ABC
      </text>
    </>
  );
}

function RetailBlock() {
  return (
    <>
      <rect x="180" y="80" width="440" height="340" fill="none" stroke={ink} strokeWidth="1.5" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="180" y1={106 + i * 26} x2="620" y2={106 + i * 26} stroke={ink} strokeWidth="0.55" />
      ))}
      <rect x="180" y="340" width="440" height="80" fill="none" stroke={ink} strokeWidth="1.2" />
      <line x1="400" y1="80" x2="400" y2="420" stroke={ink} strokeWidth="0.8" strokeDasharray="3 4" />
      <text x="188" y="68" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        12F RECONSTRUCTION
      </text>
    </>
  );
}

function HqPavilion() {
  return (
    <>
      <polygon
        points="400,110 620,200 620,360 400,430 180,360 180,200"
        fill="none"
        stroke={ink}
        strokeWidth="1.5"
      />
      <polygon points="400,160 540,220 540,330 400,380 260,330 260,220" fill="none" stroke={ink} strokeWidth="1" />
      <line x1="400" y1="110" x2="400" y2="430" stroke={ink} strokeWidth="0.6" />
      <text x="188" y="96" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        HQ 1–3F
      </text>
    </>
  );
}

function FacadeStudy() {
  return (
    <>
      <rect x="150" y="70" width="500" height="360" fill="none" stroke={ink} strokeWidth="1.5" />
      {Array.from({ length: 8 }, (_, i) =>
        Array.from({ length: 6 }, (_, j) => (
          <rect
            key={`${i}-${j}`}
            x={180 + j * 76}
            y={96 + i * 40}
            width="44"
            height="22"
            fill="none"
            stroke={ink}
            strokeWidth="0.75"
          />
        )),
      )}
      <line x1="150" y1="390" x2="650" y2="390" stroke={ink} strokeWidth="1.4" />
      <text x="158" y="58" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        ELEVATION / FACADE CODE
      </text>
    </>
  );
}

function OfficeFitout() {
  return (
    <>
      <rect x="90" y="90" width="620" height="320" fill="none" stroke={ink} strokeWidth="1.4" />
      <rect x="120" y="120" width="180" height="120" fill="none" stroke={ink} strokeWidth="1" />
      <rect x="330" y="120" width="160" height="250" fill="none" stroke={ink} strokeWidth="1" />
      <rect x="520" y="120" width="160" height="90" fill="none" stroke={ink} strokeWidth="1" />
      <rect x="520" y="230" width="160" height="140" fill="none" stroke={ink} strokeWidth="1" />
      <line x1="120" y1="280" x2="300" y2="280" stroke={ink} strokeWidth="0.7" />
      <circle cx="210" cy="340" r="24" fill="none" stroke={ink} strokeWidth="0.9" />
      <text x="98" y="76" fill={ink} fontSize="11" letterSpacing="2" fontFamily="ui-sans-serif, system-ui">
        FIT-OUT PLAN
      </text>
    </>
  );
}

const DRAWINGS: Record<DrawingKind, () => ReactNode> = {
  'warehouse-campus': WarehouseCampus,
  'service-yard': ServiceYard,
  'clinic-lowrise': ClinicLowrise,
  'clinic-campus': ClinicCampus,
  'residential-tower': ResidentialTower,
  'residential-block': ResidentialBlock,
  'office-bar': OfficeBar,
  'factory-plant': FactoryPlant,
  'retail-block': RetailBlock,
  'hq-pavilion': HqPavilion,
  'facade-study': FacadeStudy,
  'office-fitout': OfficeFitout,
};

export function MassingDrawing({ kind, className, title }: Props) {
  const Drawing = DRAWINGS[kind];
  return (
    <div className={`overflow-hidden border border-rule bg-paper ${className ?? ''}`}>
      <Frame title={title}>
        <Drawing />
      </Frame>
    </div>
  );
}
