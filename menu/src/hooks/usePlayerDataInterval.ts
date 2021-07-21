import { useEffect } from "react";
import {
  PlayerData,
  useFetchEpochState,
  VehicleStatus,
  useSetRawPlayers,
} from "../state/players.state";
import { merge } from "lodash";
import { Vector3 } from "../types/misc.types";
import { distBetweenCoords } from "../utils/coordsUtils";
import { parseIdentifier } from "../utils/miscUtils";

const INTERVAL_DURATION = 5000;

interface PlayerListResponseData {
  h: number;
  ids: string[];
  name: string;
  c: {
    x: number;
    y: number;
    z: number;
  };
  v: string;
}

type PlayerListResponse = {
  error: string | null;
  ts: number | unknown;
  data?: Record<string, PlayerListResponseData> | [];
  diff?: Record<string, Partial<PlayerListResponseData>> | [];
};

// We are storing current coords in a global object in order to be NON-REACTIVE
// as well as being accessible with the closure of setInterval. See useNuiListenerService.tsx
// for updating functionality.
const convertPlayerData = (
  playerRespData:
    | Record<string, PlayerListResponseData>
    | Record<string, Partial<PlayerListResponseData>>
): PlayerData[] => {
  const players: PlayerData[] = [];

  for (const [id, playerData] of Object.entries(playerRespData)) {
    console.log(
      "Coord Distance",
      (window as any).__txMenuCurrentCoords,
      playerData.c
    );

    const dist = distBetweenCoords(
      playerData.c as Vector3,
      (window as any).__txMenuCurrentCoords
    );
    players.push({
      distance: dist,
      id: parseInt(id),
      username: playerData.name,
      // TODO: Verify license resp
      license: playerData.ids ? parseIdentifier(playerData.ids[0]) : "",
      vehicleStatus: playerData.v as VehicleStatus,
      health: playerData.h,
    });
  }
  return players;
};

const fetchPlayerData = async (
  epoch: number | null
): Promise<PlayerListResponse> => {
  try {
    const resp = await fetch("http://localhost:30120/monitor/players.json", {
      headers: {
        "x-txadmin-token": "xxxx_Debug_Token_xxx",
        "x-txadmin-epoch": epoch && epoch.toString(),
      },
    });

    if (!resp.ok) new Error('Response was not "ok"');

    const respJson = (await resp.json()) as PlayerListResponse;

    // Schema validation
    if (typeof respJson.error === "string")
      new Error(`API Error: ${respJson.error}`);

    if (typeof respJson.ts !== "number") new Error(`Invalid response schema`);

    if (respJson.ts < epoch) new Error("Out of order reply");

    return respJson;
  } catch (e) {
    console.log(e);
    throw new Error(`Was unable to fetch and set player data: ${e.message}`);
  }
};

export const usePlayerDataInterval = () => {
  const [epoch, setEpoch] = useFetchEpochState();
  const setRawPlayerData = useSetRawPlayers();

  useEffect(() => {
    console.log("Running effect");
    const interval = setInterval(() => {
      fetchPlayerData(epoch).then((retData) => {
        // If we are in the current epoch
        if (typeof retData.data === "object" && retData.data !== null) {
          if (Array.isArray(retData.data)) retData.data = {};

          const convertedPlayerData = convertPlayerData(retData.data);
          setRawPlayerData(convertedPlayerData);
          console.log("Player list");
          console.dir(convertedPlayerData);
          setEpoch(retData.ts as number);
          // If the epoch is different we need to merge the changes
        } else if (typeof retData.diff === "object" && retData.diff !== null) {
          setEpoch((curEpoch) => {
            if (!curEpoch || typeof curEpoch !== "number") {
              throw new Error(
                `No epoch for diff response or epoch is not number. Epoch: ${curEpoch}`
              );
            }
            if (Array.isArray(retData.diff)) retData.diff = {};

            const convertedPlayers = convertPlayerData(retData.diff);

            setRawPlayerData((curPlayerData) => {
              const mergedPlayerList = merge(curPlayerData, convertedPlayers);

              console.log("Merged playerlist");
              console.dir(mergedPlayerList);
              return mergedPlayerList;
            });

            return retData.ts as number;
          });
        }
      });
    }, INTERVAL_DURATION);
    return () => clearInterval(interval);
  }, []);
};
