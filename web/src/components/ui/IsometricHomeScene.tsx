type IsometricHomeSceneProps = {
  variant?: 'hero' | 'compact';
};

export const IsometricHomeScene = ({
  variant = 'compact',
}: IsometricHomeSceneProps) => (
  <div
    className={`sh-isometric-scene sh-isometric-scene--${variant}`}
    role="img"
    aria-label="Ilustración isométrica de un hogar conectado"
  >
    <svg viewBox="0 0 240 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path className="sh-scene-ground" d="m120 18 101 58v58l-101 58L19 134V76l101-58Z" />
      <path className="sh-scene-link" d="m54 111 36 20m96-20-36 20m-30 21v15" />
      <path className="sh-scene-wall" d="m65 77 55-32 55 32v40l-55 32-55-32V77Z" />
      <path className="sh-scene-edge" d="m65 77 55 32 55-32m-55 32v40" />
      <path className="sh-scene-roof" d="m76 69 44-26 44 26m-88 0v-9l44-26 44 26v9" />
      <path className="sh-scene-door" d="M111 105v30l17 10v-30l-17-10Z" />
      <path className="sh-scene-window" d="m80 89 15 9v14l-15-9V89Zm65 9 15-9v14l-15 9V98Z" />
      <circle className="sh-scene-node sh-scene-node--one" cx="49" cy="108" r="5" />
      <circle className="sh-scene-node sh-scene-node--two" cx="191" cy="108" r="5" />
      <circle className="sh-scene-node sh-scene-node--three" cx="120" cy="162" r="5" />
    </svg>
  </div>
);
