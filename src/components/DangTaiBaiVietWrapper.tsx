import { getAllChude } from "@/actions/Chude.action";
import DangTaiBaiViet from "./DangTaiBaiViet";

type Props = {
  macDinhChuDeID?: number;
};

export default async function DangTaiBaiVietWrapper({ macDinhChuDeID }: Props) {
  let chudeList = null;

  // Chỉ load danh sách chủ đề nếu không có chủ đề mặc định
  if (!macDinhChuDeID) {
    chudeList = await getAllChude();
  }

  return (
    <DangTaiBaiViet
      chudeList={chudeList || undefined}
      macDinhChuDeID={macDinhChuDeID}
    />
  );
}
