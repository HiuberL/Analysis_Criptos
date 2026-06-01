import { WhaleTrade } from "@renderer/interfaces/binance.interface";
import { GlobalDataFuture, GlobalTrack } from "@renderer/interfaces/indicators.interface";
import { useState } from "react";

export const useWhaleTrackerState = () => {
  const [whaleTrades, setWhaleTrades] = useState<WhaleTrade[]>([]);
  const [whaleBuyVolume, setWhaleBuyVolume] = useState<number>(0);
  const [whaleSellVolume, setWhaleSellVolume] = useState<number>(0);
  const [whaleTrack, setWhaleTrack] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);  
  const [globalTrack, setGlobalTrack] = useState<GlobalDataFuture>({
    long: 0,
    short:0});
  const [globalTrackDetail, setGlobalTrackDetail] = useState<GlobalTrack>({
    longShortRatio: 1.0,
    buyVol: 0,
    sellVol: 0,
    openInterest: 0
  });  
return {
    whaleTrades, setWhaleTrades,
    whaleBuyVolume, setWhaleBuyVolume,
    whaleSellVolume, setWhaleSellVolume,
    whaleTrack, setWhaleTrack,
    loading, setLoading,
    globalTrack,setGlobalTrack,
    globalTrackDetail, setGlobalTrackDetail
  }
};