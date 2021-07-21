import {
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import { Vector3 } from "../types/misc.types";

export interface PlayerData {
  id: number;
  vehicleStatus: VehicleStatus;
  distance: number;
  health: number;
  username: string;
  license: string;
}

export enum PlayerDataSort {
  IdJoinedFirst = "idJoinedFirst",
  IdJoinedLast = "idJoinedLast",
  DistanceClosest = "distanceClosest",
  DistanceFarthest = "distanceFarthest",
}

export enum VehicleStatus {
  Unknown = "unknown",
  Walking = "walking",
  Driving = "driving",
  Flying = "flying", //planes or heli
  Boat = "boating",
  Biking = "biking",
}

const PlayerListStates = {
  // The current coords of the player
  currentCoords: atom<Vector3>({
    key: "currentPlayersCoords",
    default: { x: 0, y: 0, z: 0 },
  }),
  currentFetchEpoch: atom<number | null>({
    key: "currentFetchEpoch",
    default: null,
  }),
  //
  playerData: atom<PlayerData[]>({
    key: "playerListData",
    default: [],
  }),
  // The sort type
  selectedSortType: atom<PlayerDataSort>({
    key: "playerFilterType",
    default: PlayerDataSort.IdJoinedFirst,
  }),
  // The search input value
  playerSearchValue: atom({
    key: "playerSearchInputValue",
    default: "",
  }),
  // A selector for filtering our data and displaying it
  filteredPlayerData: selector<PlayerData[]>({
    key: "filteredPlayerData",
    get: ({ get }) => {
      const sortType = get(PlayerListStates.selectedSortType) as PlayerDataSort;
      const playerSearchValue = get(
        PlayerListStates.playerSearchValue
      ) as string;
      const rawPlayerStates = get(PlayerListStates.playerData) as PlayerData[];

      const formattedInput = playerSearchValue.trim().toLowerCase();

      // Lets filter player states by search value or simply return a new array
      // with the raw player states. Either way we are returning a new array to
      // prevent mutation
      const filteredPlayerStates: PlayerData[] = playerSearchValue
        ? rawPlayerStates.filter(
            (player) =>
              player.username.toLowerCase().includes(formattedInput) ||
              player.id.toString().includes(formattedInput)
          )
        : [...rawPlayerStates];

      // Now we will apply the sort type and return our sorted data
      switch (sortType) {
        case PlayerDataSort.DistanceClosest:
          return filteredPlayerStates.sort((a, b) => a.distance - b.distance);
        case PlayerDataSort.DistanceFarthest:
          return filteredPlayerStates.sort((a, b) => b.distance - a.distance);
        case PlayerDataSort.IdJoinedFirst:
          return filteredPlayerStates.sort((a, b) => a.id - b.id);
        case PlayerDataSort.IdJoinedLast:
          return filteredPlayerStates.sort((a, b) => b.id - a.id);
        default:
          return filteredPlayerStates;
      }
    },
  }),
};

export const useFetchEpochState = () =>
  useRecoilState(PlayerListStates.currentFetchEpoch);

export const useCurCoordsValue = () =>
  useRecoilValue(PlayerListStates.currentCoords);
export const useSetPlayerCoordsValue = () =>
  useSetRecoilState(PlayerListStates.currentCoords);

export const useRawPlayersState = () =>
  useRecoilState(PlayerListStates.playerData);
export const useRawPlayersValue = () =>
  useRecoilValue(PlayerListStates.playerData);
export const useSetRawPlayers = () =>
  useSetRecoilState(PlayerListStates.playerData);

export const useSetSearchPlayers = () =>
  useSetRecoilState(PlayerListStates.playerSearchValue);

export const usePlayersSortTypeState = () =>
  useRecoilState(PlayerListStates.selectedSortType);

export const useFilteredPlayersValue = () =>
  useRecoilValue(PlayerListStates.filteredPlayerData);
