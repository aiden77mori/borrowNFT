
const useUploadFileToStorage = async (imgData: any, delImgData?: any) => {
  // if (delImgData) await deleteObject(refStorage(storage, delImgData));

  // const storageRef = refStorage(
  //   storage,
  //   `/avatar/${new Date().getTime()} - ${imgData.name}`
  // );
  // const snap = await uploadBytes(storageRef, imgData);
  // const avatarUrl = await getDownloadURL(
  //   refStorage(storage, snap.ref.fullPath)
  // );
  // console.log(avatarUrl);

  // return avatarUrl;
};

export default useUploadFileToStorage;
