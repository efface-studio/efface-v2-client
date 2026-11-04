import { SWARM_BLUE, SWARM_RED, SWARM_RULER } from "./swarm.constants";

/** The overlay's own styles, inside its shadow root (the page's CSS can't reach in, nor this out). */
export const SWARM_CSS = `
:host{all:initial;position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:var(--font-sans,ui-sans-serif,system-ui,sans-serif);color:#f4f4f6;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
.shield{position:fixed;inset:0;pointer-events:auto;cursor:default;background:transparent}
.cover{position:fixed;inset:0;opacity:0;background:#0a0a0b}
.stage{position:fixed;inset:0;overflow:hidden}
.logo{position:fixed;left:50%;top:50%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:16px;background:#1b1b21;box-shadow:0 0 0 1px rgba(255,255,255,.08),0 12px 40px rgba(0,0,0,.5);display:grid;place-items:center;opacity:0;color:#f4f4f6}
.logo svg{width:36px;height:36px}
.house{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none}
.house svg{position:absolute;left:-22px;top:-30px;width:44px;height:44px;opacity:0;transform:translateY(10px) scale(.6);transform-origin:50% 100%;transition:opacity .25s,transform .35s cubic-bezier(.34,1.56,.64,1);filter:drop-shadow(0 6px 14px rgba(0,0,0,.5))}
.house.show svg{opacity:1;transform:none}
.house.leave svg{opacity:0;transform:translateY(8px) scale(.7);transition:opacity .35s .15s,transform .35s .15s ease-in}
.house .win{fill:#2a2a31;transition:fill .4s}
.house.lit .win{fill:#ffd23f}
.house.lit .glow{opacity:1}
.house .glow{opacity:0;transition:opacity .5s}
.cursor{position:absolute;left:0;top:0;width:0;height:0;will-change:transform;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}
.cursor svg{display:block}
.sel{position:absolute;left:0;top:0;border:1px solid ${SWARM_BLUE};will-change:transform}
.sel.plain{border-color:rgba(13,153,255,.75)}
.sel .ph{position:absolute;inset:0;background:rgba(255,255,255,.07)}
.sel .ph.media{background:rgba(255,255,255,.09) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='none' stroke='%23ffffff55' stroke-width='1.6'%3E%3Crect x='2' y='3' width='18' height='16' rx='2'/%3E%3Ccircle cx='8' cy='9' r='2'/%3E%3Cpath d='m20 15-5-5L4 19'/%3E%3C/svg%3E") center/22px no-repeat}
.sel b{position:absolute;width:7px;height:7px;background:#fff;border:1px solid ${SWARM_BLUE}}
.sel b:nth-of-type(1){left:-4px;top:-4px}.sel b:nth-of-type(2){right:-4px;top:-4px}.sel b:nth-of-type(3){left:-4px;bottom:-4px}.sel b:nth-of-type(4){right:-4px;bottom:-4px}
.sel.plain b{display:none}
.sel em{position:absolute;left:50%;top:calc(100% + 6px);transform:translateX(-50%);font:600 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;font-style:normal;color:#fff;background:${SWARM_BLUE};padding:3px 5px;border-radius:3px;white-space:nowrap}
.sel.plain em,.sel.move em{display:none}
.sel.move{border-color:rgba(13,153,255,.9)}
.ghost{position:absolute;left:0;top:0;border:1px dashed ${SWARM_BLUE};background:rgba(13,153,255,.08)}
.measure{position:absolute;left:0;top:0;background:${SWARM_RED}}
.measure::after{content:attr(data-gap);position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:600 10px/1 ui-monospace,Menlo,monospace;color:#fff;background:${SWARM_RED};padding:2px 4px;border-radius:3px}
.guide{position:absolute;left:0;top:0;background:${SWARM_RED};opacity:.9}
.pen{position:absolute;left:0;top:0;border-top:1px solid ${SWARM_BLUE};border-left:1px solid ${SWARM_BLUE}}
.pen::before,.pen::after{content:"";position:absolute;width:6px;height:6px;background:#fff;border:1px solid ${SWARM_BLUE};border-radius:50%}
.pen::before{left:-4px;top:-4px}.pen::after{right:-4px;bottom:-4px}
.ruler{position:fixed;left:0;top:0;opacity:0;transition:opacity .5s}
.ruler.top{width:100%;height:${SWARM_RULER}px}
.ruler.left{width:${SWARM_RULER}px;height:100%}
.bar{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);display:flex;align-items:center;gap:14px;padding:8px 10px 8px 16px;border-radius:14px;background:rgba(24,24,28,.94);box-shadow:0 0 0 1px rgba(255,255,255,.08),0 16px 40px rgba(0,0,0,.45);font-size:13px;pointer-events:auto;white-space:nowrap;max-width:calc(100vw - 24px);animation:rise .5s cubic-bezier(.22,1,.36,1)}
@keyframes rise{from{opacity:0;transform:translate(-50%,12px)}}
.bar .faces{display:flex}
.bar .faces span{width:20px;height:20px;margin-left:-5px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;box-shadow:0 0 0 2px #18181c}
.bar .faces span:first-child{margin-left:0}
.bar strong{font-weight:600}
.bar .dim{color:#8a8a93}
.bar .sep{width:1px;height:16px;background:rgba(255,255,255,.12)}
.bar .track{width:90px;height:3px;border-radius:2px;background:rgba(255,255,255,.12);overflow:hidden}
.bar .track i{display:block;height:100%;background:#f4f4f6;transition:width .3s}
.bar .track.scan i{width:40%;animation:scan 1.1s ease-in-out infinite}
@keyframes scan{from{transform:translateX(-100%)}to{transform:translateX(250%)}}
.bar button{all:unset;cursor:pointer;padding:5px 9px;border-radius:8px;color:#f4f4f6;font-weight:600;font-size:12px}
.bar button:hover{background:rgba(255,255,255,.08)}
.bar button:focus-visible{outline:2px solid #3b62e5;outline-offset:1px}
.bar button[aria-pressed="true"]{background:rgba(255,255,255,.12)}
.bar button.primary{background:#3b62e5;color:#fff;padding:6px 12px}
.bar button.primary:hover{background:#4b70ee}
.bar button.icon{padding:5px 7px;color:#8a8a93}
.bar button.icon:hover{color:#f4f4f6}
.bar svg{display:block;width:14px;height:14px}
@media (max-width:640px){.bar{gap:9px;padding:7px 8px 7px 12px;bottom:14px;font-size:12px}.bar .hide-sm{display:none}}
@media (prefers-reduced-motion:reduce){.bar,.track.scan i{animation:none}}
`;
