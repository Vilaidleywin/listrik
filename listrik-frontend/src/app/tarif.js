export function tarifPerKwh(voltase) {
  switch (String(voltase)) {
    case "450":
      return 415;
    case "900":
      return 1352;
    case "1300":
      return 1444;
    case "2200":
      return 1444;
    case "3500":
      return 1699;
    default:
      return 1444;
  }
}
