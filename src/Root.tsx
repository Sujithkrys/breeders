import "./index.css";
import { Composition } from "remotion";
import { CluesoMcp45 } from "./clueso-mcp/CluesoMcp45";
import { FPS, HEIGHT, TOTAL_UNITS, WIDTH } from "./clueso-mcp/theme";
import { CluesoLaunch } from "./clueso-launch/CluesoLaunch";
import { TOTAL as CLUESO_UNITS } from "./clueso-launch/theme";
import { PineLaunch } from "./pine-launch/PineLaunch";
import { TOTAL as LAUNCH_UNITS } from "./pine-launch/theme";
import { PinePro } from "./pine-pro/PinePro";
import { TOTAL_UNITS as PINE_UNITS } from "./pine-pro/theme";
import { COOKED, Cooked } from "./guava/Cooked";
import { PINE_COOKED, PineCooked } from "./pine-cooked/Cooked";
import { APPLE_PAY, ApplePayIndia } from "./apple-pay/ApplePay";
import { ARGON, GeminiArgon } from "./gemini-argon/Argon";
import { ClaudeSonnet, SONNET } from "./claude-sonnet/Sonnet";
import { SonnetStyle } from "./claude-sonnet/Style";
import { ClaudeSonnetShort, SHORT } from "./claude-sonnet/Short";
import { CLAUDE30, ClaudeSonnet30 } from "./claude-sonnet/ClaudePine";
import { ClaudeDemo, DEMO } from "./claude-sonnet/Demo";
import { SonnetDemoFrames } from "./claude-sonnet/DemoFrames";
import { ClaudeSonnetDemo, SONNET_DEMO } from "./claude-sonnet/SonnetDemo";
import { ApplePayProof } from "./apple-pay/Proof";
import { ApplePayStyle } from "./apple-pay/Style";
import { DotsProto, PlacesProof } from "./apple-pay/DotsProto";
import { SarvamLive } from "./sarvam-live/SarvamLive";
import { FPS as SL_FPS, HEIGHT as SL_H, TOTAL_SEC as SL_SEC, WIDTH as SL_W } from "./sarvam-live/theme";
import { LogoCheck } from "./brand/LogoCheck";
import { MustangFrames } from "./mustang/Frames";
import { MustangRealFrames } from "./mustang/RealFrames";
import { MustangWorldFrames } from "./mustang/WorldFrames";
import { MUSTANG, MustangBeatIt } from "./mustang/Film";
import { BEATME, MustangBeatMe } from "./mustang/BeatMe";
import { SpotifyStems, STEMS_FILM } from "./spotify-stems/StemsFilm";
import { loadFonts, toFrames } from "./utils";

loadFonts();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="SpotifyStems" component={SpotifyStems} durationInFrames={Math.round(STEMS_FILM.seconds * STEMS_FILM.fps)} fps={STEMS_FILM.fps} width={STEMS_FILM.width} height={STEMS_FILM.height} />
      <Composition id="MustangBeatMe" component={MustangBeatMe} durationInFrames={Math.round(BEATME.seconds * BEATME.fps)} fps={BEATME.fps} width={BEATME.width} height={BEATME.height} />
      <Composition id="MustangBeatIt" component={MustangBeatIt} durationInFrames={Math.round(MUSTANG.seconds * MUSTANG.fps)} fps={MUSTANG.fps} width={MUSTANG.width} height={MUSTANG.height} />
      <Composition id="MustangWorldFrames" component={MustangWorldFrames} durationInFrames={3} fps={30} width={1920} height={1080} />
      <Composition id="MustangRealFrames" component={MustangRealFrames} durationInFrames={3} fps={30} width={1920} height={1080} />
      <Composition id="MustangFrames" component={MustangFrames} durationInFrames={3} fps={30} width={1920} height={1080} />
      <Composition id="LogoCheck" component={LogoCheck} durationInFrames={30} fps={30} width={1920} height={1080} />
      <Composition id="ClaudeSonnetDemo" component={ClaudeSonnetDemo} durationInFrames={toFrames(SONNET_DEMO.units, SONNET_DEMO.fps)} fps={SONNET_DEMO.fps} width={SONNET_DEMO.width} height={SONNET_DEMO.height} />
      <Composition id="SonnetDemoFrames" component={SonnetDemoFrames} durationInFrames={90} fps={30} width={1920} height={1080} />
      <Composition id="ClaudeDemo30" component={ClaudeDemo} durationInFrames={Math.round(DEMO.seconds * DEMO.fps)} fps={DEMO.fps} width={DEMO.width} height={DEMO.height} />
      <Composition id="ClaudeSonnet30" component={ClaudeSonnet30} durationInFrames={toFrames(CLAUDE30.units, CLAUDE30.fps)} fps={CLAUDE30.fps} width={CLAUDE30.width} height={CLAUDE30.height} />
      <Composition id="ClaudeSonnet28" component={ClaudeSonnetShort} durationInFrames={Math.round(SHORT.seconds * SHORT.fps)} fps={SHORT.fps} width={SHORT.width} height={SHORT.height} />
      <Composition id="SonnetStyle" component={SonnetStyle} durationInFrames={90} fps={30} width={1920} height={1080} />
      <Composition id="ClaudeSonnet" component={ClaudeSonnet} durationInFrames={Math.round(SONNET.seconds * SONNET.fps)} fps={SONNET.fps} width={SONNET.width} height={SONNET.height} />
      <Composition id="GeminiArgon" component={GeminiArgon} durationInFrames={Math.round(ARGON.seconds * ARGON.fps)} fps={ARGON.fps} width={ARGON.width} height={ARGON.height} />
      <Composition id="ApplePayIndia" component={ApplePayIndia} durationInFrames={Math.round(APPLE_PAY.seconds * APPLE_PAY.fps)} fps={APPLE_PAY.fps} width={APPLE_PAY.width} height={APPLE_PAY.height} />
      <Composition id="ApplePayProof" component={ApplePayProof} durationInFrames={1} fps={60} width={1920} height={1080} />
      <Composition id="ApplePayStyle" component={ApplePayStyle} durationInFrames={3} fps={60} width={1920} height={1080} />
      <Composition id="ApplePayDots" component={DotsProto} durationInFrames={8 * 60} fps={60} width={1920} height={1080} />
      <Composition id="ApplePlaces" component={PlacesProof} durationInFrames={7} fps={60} width={1920} height={1080} />
      <Composition id="PineCooked" component={PineCooked} durationInFrames={Math.round(PINE_COOKED.seconds * PINE_COOKED.fps)} fps={PINE_COOKED.fps} width={PINE_COOKED.width} height={PINE_COOKED.height} />
      <Composition id="GuavaCooked60" component={Cooked} durationInFrames={Math.round(COOKED.seconds * COOKED.fps)} fps={COOKED.fps} width={COOKED.width} height={COOKED.height} />
      <Composition id="SarvamLive60" component={SarvamLive} durationInFrames={SL_SEC * SL_FPS} fps={SL_FPS} width={SL_W} height={SL_H} />
      <Composition
        id="CluesoMCP45"
        component={CluesoMcp45}
        durationInFrames={toFrames(TOTAL_UNITS, FPS)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition id="CluesoLaunch47" component={CluesoLaunch} durationInFrames={toFrames(CLUESO_UNITS, FPS)} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="PineLaunch46" component={PineLaunch} durationInFrames={toFrames(LAUNCH_UNITS, FPS)} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="PinePro25" component={PinePro} durationInFrames={toFrames(PINE_UNITS, FPS)} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  );
};
