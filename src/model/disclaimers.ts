export interface IDisclaimerDTO {
  text: string;
  show: boolean;
  toBeMantained: boolean;
}

export const configDisclaimers = (
  _response: any,
  _setDisclaimerMap: any,
  _show = false
) => ({});
