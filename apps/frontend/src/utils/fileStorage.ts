import { addFileInChat, IFileMetaData, removeAllFileFromChat, removeFileFromChat } from "@/redux/slices/selectedAttachment";
import { Dispatch } from "@reduxjs/toolkit";
import { getFileExtension, getFileType } from "./utility";

export interface IFileData {
  id: string,
  file: File
}
class FileStorage{
  private static instance: FileStorage;
  private storage: Map<string, Map<string, File>>;

  private constructor(){
    this.storage = new Map();
  }

  public static getInstance():FileStorage{
    if(!FileStorage.instance){
      FileStorage.instance = new FileStorage();
    }
    return FileStorage.instance;
  }

  public addFiles(chatId:string, files: IFileData[], dispatch: Dispatch){
    if(!this.storage.has(chatId)){
      this.storage.set(chatId, new Map());
    }
    const filesForRedux: IFileMetaData[] = [];
    const chatFiles = this.storage.get(chatId)!;
    files.forEach(({id, file}) => {
      if(!chatFiles.has(id)){
        chatFiles.set(id, file);
        filesForRedux.push({
          extension: getFileExtension(file.name) || undefined,
          id,
          name: file.name,
          size: file.size,
          type: getFileType(file.type)
        });
      }
    });
    dispatch(addFileInChat({chatId, files: filesForRedux}));
  }

  public removeFile(chatId: string, fileId: string, dispatch: Dispatch){
    if(this.storage.has(chatId)){
      const chatFiles = this.storage.get(chatId)!;
      chatFiles.delete(fileId);
      dispatch(removeFileFromChat({chatId, fileId}));
    }
  }

  public getFiles(chatId: string): File[] {
    const chatFiles = this.storage.get(chatId);
    if(!chatFiles) return [];
    return Array.from(chatFiles.values());
  }

  public clearFiles(chatId: string, dispatch: Dispatch){
    this.storage.delete(chatId);
    dispatch(removeAllFileFromChat({chatId}));
  }

  public getSingleFile(chatId: string, fileId :string){
    if(this.storage.has(chatId))
      return this.storage.get(chatId)?.get(fileId);
  }
}

export default FileStorage;