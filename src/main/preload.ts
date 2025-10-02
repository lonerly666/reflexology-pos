// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('api', {
  //transactions
  newTransaction: (data: any) => ipcRenderer.invoke('db:newTransaction', data),
  getTransactions: (dateRange: { startDate: string; endDate: string }) =>
    ipcRenderer.invoke('db:getTransactions', dateRange),
  getTransactionById: (id: string) =>
    ipcRenderer.invoke('db:getTransactionById', id),
  updateTransactionStatus: (id: string, status: string) =>
    ipcRenderer.invoke('db:updateTransactionStatus', id, status),
  getPendingTransactions: () => ipcRenderer.invoke('db:getPendingTransactions'),
  deletePendingTransaction: (id: string) =>
    ipcRenderer.invoke('db:deletePendingTransaction', id),
  updateTransactions: (data: any) =>
    ipcRenderer.invoke('db:updateTransactions', data),
  getWorkerTransactions: (data: any) =>
    ipcRenderer.invoke('db:getWorkerTransactions', data),

  //services
  getServices: () => ipcRenderer.invoke('db:getServices'),
  addService: (service: any) => ipcRenderer.invoke('db:addService', service),
  updateService: (service: any) =>
    ipcRenderer.invoke('db:updateService', service),
  deleteService: (id: number) => ipcRenderer.invoke('db:deleteService', id),

  //members
  getMembers: () => ipcRenderer.invoke('db:getMembers'),
  addMember: (member: any) => ipcRenderer.invoke('db:addMember', member),
  searchMember: (param: any) => ipcRenderer.invoke('db:searchMember', param),
  deleteMember: (id: any) => ipcRenderer.invoke('db:deleteMember', id),
  updateMember: (value: any) => ipcRenderer.invoke('db:updateMember', value),

  //workers
  getWorkers: () => ipcRenderer.invoke('db:getWorkers'),
  getWorkersByDate: (data: any) =>
    ipcRenderer.invoke('db:getWorkersByDate', data),
  addWorker: (worker: any) => ipcRenderer.invoke('db:addWorker', worker),
  updateWorker: (worker: any) => ipcRenderer.invoke('db:updateWorker', worker),
  deleteWorker: (id: any) => ipcRenderer.invoke('db:deleteWorker', id),
  searchWorker: (params: any) => ipcRenderer.invoke('db:searchWorker', params),
  getWorkerPerformanceById: (id: any) =>
    ipcRenderer.invoke('db:getWorkerPerformanceById', id),
});

export type ElectronHandler = typeof electronHandler;
