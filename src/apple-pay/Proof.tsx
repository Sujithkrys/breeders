// Side-by-side check of the rebuilt iPhone/Wallet/card against Apple's press image (dev only).
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { DoneTick, IPhone, phoneGeom, RealWatch, WalletScreen } from "./real";

export const ApplePayProof: React.FC = () => {
  const w = 430;
  const g = phoneGeom(w);
  return (
    <AbsoluteFill style={{ background: "#FAFAFC", flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
      <Img src={staticFile("applepay/press.jpg")} style={{ height: 1000 }} />
      <div style={{ position: "relative", width: 700, height: 1000 }}>
        <div style={{ position: "absolute", left: 60, top: 40 }}>
          <IPhone w={w}>
            <WalletScreen sw={g.sw} sh={g.sh}>
              <DoneTick p={1} size={g.sw * 0.16} />
              <div style={{ fontFamily: "Inter", fontSize: g.sw * 0.06, color: "#8E8E93", marginTop: g.sw * 0.03 }}>Done</div>
            </WalletScreen>
          </IPhone>
        </div>
        <div style={{ position: "absolute", left: 410, top: 520 }}>
          <RealWatch w={240} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
