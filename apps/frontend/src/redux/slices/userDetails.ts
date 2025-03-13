import { UserDetails } from "@/interface/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define an interface for UserDetails with priority to keep track of which user was added first
export interface UserDetailsWithPriority {
  priority: number; // Used to determine the order in which users were added
  userData: UserDetails | string; // The actual user data, or null if no user data
}

// Define the state structure for the user details store
interface IUserDetails {
  users: { // Stores user details indexed by their userId
    [userId: string]: UserDetailsWithPriority;
  };
  currentPriority: number; // Used to assign a priority to each new user that is added
}

// Define the payload type when adding a new user
interface UserDetailsPayload {
  userId: string; // The unique ID of the user
  userData: UserDetails | string; // The actual user data to store
}

interface RequestSent {
  userId: string;
  actionToPerform: "request_sent";
  friendshipId: string; // compulsory for request_sent
}
interface OtherActions {
  userId: string;
  actionToPerform: Exclude<"request_accepted" | "request_rejected" | "request_cancelled" | "unfriend", "request_sent">;
  friendshipId?: string; // optional for other actions
}
// Union type to combine both interfaces
type UpdateUserDetails = RequestSent | OtherActions;

const initialState: IUserDetails = {
  users: {},
  currentPriority: 0,
};

const totalUserLimit = 20;
const userDetailsSlice = createSlice({
  name: "user-details",
  initialState,
  reducers: {
    addUserDetails: (state, action: PayloadAction<UserDetailsPayload>) => {
      const totalUsers = Object.keys(state.users).length; // Get the current number of users in the state
      // If the number of users reaches the defined limit, remove the user with the lowest priority (oldest)
      if (totalUsers === totalUserLimit) {
        const lowestPriorityKey = Object.keys(state.users).reduce((a, b) =>
          state.users[a].priority < state.users[b].priority ? a : b
        );
        delete state.users[lowestPriorityKey];
      }
      // Add the new user to the store with the next priority value
      state.users[action.payload.userId] = {
        userData: action.payload.userData, // Store user details passed in the payload
        priority: state.currentPriority, // Assign the current priority value to this user
      };
      state.currentPriority++;
    },
    updateUserDetails: (state, action: PayloadAction<UpdateUserDetails>) => {
      const { actionToPerform, userId, friendshipId } = action.payload;
      const userData = state.users[userId].userData;
      if (typeof userData === "string") return;
      switch (actionToPerform) {
        case "request_sent":
          userData.friendship = {
            friendshipStatus: "pending",
            isYouSender: true,
            friendshipId
          }
          break;
        case "request_accepted":
          if (userData.friendship) userData.friendship.friendshipStatus = "accepted";
          break;
        case "request_cancelled":
          userData.friendship = null;
          console.log(userData.friendship);
          break;
        case "request_rejected":
          userData.friendship = null;
          break;
        case "unfriend":
          console.log("handle unfriend");
          break;
        default:
          console.log("This is not supposed to happen");
          break;
      }
      state.users[userId].userData = {...userData};
    }
  },
});

export const { addUserDetails, updateUserDetails } = userDetailsSlice.actions;
export default userDetailsSlice.reducer;
