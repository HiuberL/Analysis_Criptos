import { WhaleTrade } from "@renderer/interfaces/binance.interface";
import { GlobalDataFuture } from "@renderer/interfaces/indicators.interface";
import { useState } from "react";

export const useWhaleTrackerState = () => {
  const [whaleTrades, setWhaleTrades] = useState<WhaleTrade[]>([]);
  const [whaleBuyVolume, setWhaleBuyVolume] = useState<number>(0);
  const [whaleSellVolume, setWhaleSellVolume] = useState<number>(0);
  const [whaleTrack, setWhaleTrack] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);  
  const [globalTrack, setGlobalTrack] = useState<GlobalDataFuture>({
    long: 0,
    short:0
  }
  );  
return {
    whaleTrades, setWhaleTrades,
    whaleBuyVolume, setWhaleBuyVolume,
    whaleSellVolume, setWhaleSellVolume,
    whaleTrack, setWhaleTrack,
    loading, setLoading,
    globalTrack,setGlobalTrack
  }
};