# Pocket Bricks Sound

Pocket Bricks does not ship copied Nokia sound files or any proprietary audio assets.

The game generates short square-wave beeps at runtime using the Web Audio API. This keeps the project open-source safe while preserving the old button-phone feeling.

## Sound events

| Event | Sound direction |
| --- | --- |
| Start | Three short boot beeps |
| Move left/right | Tiny low tap |
| Soft drop | Lower tap |
| Rotate | Short higher tap |
| Hard drop | Two low falling taps |
| Piece lock | Very short low click |
| Line clear | Rising beep pattern |
| Pause | Single mid beep |
| Game over | Falling four-note beep |

## Mobile behavior

Android and mobile browsers block audio until the user touches the screen. This is normal.

Sound begins after the player taps one of these:

- START
- SOUND ON
- Any control button

## Design rule

Keep sound minimal. Do not add music, voice, modern effects, long samples, or heavy audio libraries. The target is old-phone beep feedback, not arcade sound design.
