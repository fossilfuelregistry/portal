import { notification } from "antd"

const notificationError = <T>(returnValue: T) => (e:Error, title?: string):T => {
    console.error(e);
    notification.error( { message: title ?? 'An error occurred', description: e?.message??'', duration: 20 } );
    return returnValue;
}
export default notificationError