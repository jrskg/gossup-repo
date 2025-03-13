import { FileType, IAttachment } from "@/interface/chatInterface";
import type { IUploadSignature, ResponseWithData } from "@/interface/interface";
import instance from "@/utils/axiosInstance";
import FileStorage from "@/utils/fileStorage";
import { getFileType } from "@/utils/utility";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

// type SelectedFileType = Record<"images" | "otherFiles", { id: string, file: File }[]>;
export interface IFileMetaData {
  id: string;
  name: string;
  type: FileType;
  size: number;
  extension?: string;
}
interface DataPerChat {
  loading: boolean;
  uploadProgress: number;
  error: string;
  selectedFiles: IFileMetaData[];
}
// adding undefined to the Record type to avoid undefined error as the key(chatId) might not be present
export type ISelectedAttachmentState = Record<string, DataPerChat | undefined>;
const initialState: ISelectedAttachmentState = {};

export const uploadSelectedAttachments = createAsyncThunk(
  "selectedAttachment/uploadSelectedAttachments",
  async (
    { chatId, onUploadSucess }: { chatId: string, onUploadSucess: (attachments:IAttachment[]) => void },
    { dispatch, rejectWithValue }) => {
    try {
      const filesIntance = FileStorage.getInstance();
      const files = filesIntance.getFiles(chatId);
      const { data } = await instance.get<ResponseWithData<IUploadSignature>>("/message/get-signature");
      const { apiKey, cloudName, signature, timestamp, folderName } = data.data;

      const progressArray = new Array(files.length).fill(0);
      const allPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folderName);
        const { data } = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const subProgress = progressEvent.total
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
              progressArray[index] = subProgress;
              const totalProgress = Math.round(progressArray.reduce((a, b) => a + b, 0) / files.length);
              dispatch(setUploadProgress({ chatId, progress: totalProgress }));
            }
          }
        );
        const attachment: IAttachment = {
          fileType: getFileType(file.type),
          fileUrl: data.secure_url as string,
          originalFileName: file.name,
          size: file.size
        }
        return attachment;
      });
      const response = await Promise.allSettled(allPromises);
      const attachments = response.reduce<IAttachment[]>((acc, item) => {
        if (item.status === "fulfilled") {
          acc.push(item.value)
        }
        return acc;
      }, []);

      if(attachments.length === 0){
        return rejectWithValue("Failed to upload attachments, please try again");
      }

      filesIntance.clearFiles(chatId, dispatch);
      onUploadSucess(attachments);
      return { chatId }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data.message);
      }
    }
    return rejectWithValue("Something went wrong");
  }
);

export const defaultDataPerChat: DataPerChat = {
  error: "",
  loading: false,
  selectedFiles: [],
  uploadProgress: 0
};

const selectedAttachmentSlice = createSlice({
  name: "selectedAttachment",
  initialState,
  reducers: {
    addFileInChat: (state, action: PayloadAction<{ chatId: string, files: IFileMetaData[] }>) => {
      const { chatId, files } = action.payload;
      if (!state[chatId]) {
        state[chatId] = {
          ...defaultDataPerChat,
          selectedFiles: files
        }
      }
      else {
        state[chatId].selectedFiles.push(...files);
      }
    },
    removeFileFromChat: (state, action: PayloadAction<{ chatId: string, fileId: string }>) => {
      const { chatId, fileId } = action.payload;
      if (state[chatId]) {
        state[chatId].selectedFiles = state[chatId].selectedFiles.filter(file => file.id !== fileId);
      }
    },
    removeAllFileFromChat: (state, action: PayloadAction<{ chatId: string }>) => {
      const { chatId } = action.payload;
      if (state[chatId]) {
        state[chatId].selectedFiles = [];
      }
    },
    setUploadProgress: (state, action: PayloadAction<{ chatId: string, progress: number }>) => {
      const { chatId, progress } = action.payload;
      if (state[chatId]) {
        state[chatId].uploadProgress = progress;
      }
    },
    setUploadError: (state, action: PayloadAction<{ chatId: string, error: string }>) => {
      const { chatId, error } = action.payload;
      if (state[chatId]) {
        state[chatId].error = error;
      }
    },
    resetAttachment: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      if (state[chatId]) {
        state[chatId] = { ...defaultDataPerChat }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(uploadSelectedAttachments.pending, (state, action) => {
      const { chatId } = action.meta.arg;
      if (state[chatId]) {
        state[chatId].uploadProgress = 0;
        state[chatId].loading = true;
        state[chatId].error = "";
      }
    })
      .addCase(uploadSelectedAttachments.fulfilled, (state, action) => {
        const { chatId } = action.payload;
        const data = state[chatId];
        if (data) {
          data.loading = false;
          data.uploadProgress = 100;
          data.selectedFiles = [];
          data.error = "";
        }
      })
      .addCase(uploadSelectedAttachments.rejected, (state, action) => {
        const { chatId } = action.meta.arg;
        const data = state[chatId];
        if (data) {
          data.loading = false;
          data.uploadProgress = 0;
          data.error = action.payload as string;
        }
      })
  }
});

export const {
  addFileInChat,
  removeFileFromChat,
  setUploadProgress,
  setUploadError,
  resetAttachment,
  removeAllFileFromChat
} = selectedAttachmentSlice.actions;
export default selectedAttachmentSlice.reducer;