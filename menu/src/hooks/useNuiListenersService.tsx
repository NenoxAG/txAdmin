import { useSetIsMenuVisible } from "../state/visibility.state";
import { txAdminMenuPage, useSetPage } from "../state/page.state";
import { useNuiEvent } from "./useNuiEvent";
import {
  PermCheckServerResp,
  useSetPermissions,
} from "../state/permissions.state";
import { fetchNuiAuth } from "../utils/fetchNuiAuth";
import { arrayToVector3 } from "../utils/coordsUtils";
import { Vector3 } from "../types/misc.types";

const DEFAULT_WINDOW_COORDS: Vector3 = { x: 0, y: 0, z: 0 };

(window as any).__txMenuCurrentCoords = DEFAULT_WINDOW_COORDS;

// Passive Message Event Listeners & Handlers for global state
export const useNuiListenerService = () => {
  const setVisible = useSetIsMenuVisible();
  const setMenuPage = useSetPage();
  const setPermsState = useSetPermissions();

  useNuiEvent<boolean>("setDebugMode", (debugMode) => {
    (window as any).__MenuDebugMode = debugMode;
  });
  useNuiEvent<boolean>("setVisible", setVisible);
  useNuiEvent<txAdminMenuPage>("setMenuPage", setMenuPage);
  useNuiEvent("setPlayerCoords", (data: [number, number, number]) => {
    const vec3Coords = arrayToVector3(data);
    // I really don't like doing this but we don't want this to be reactive, therefore
    // giving it a global object in window is a decent option for having a constant reference
    (window as any).__txMenuCurrentCoords = vec3Coords;
    console.log(vec3Coords);
  });
  useNuiEvent<PermCheckServerResp>("reAuth", () => {
    fetchNuiAuth().then(setPermsState);
  });
};
