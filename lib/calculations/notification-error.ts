import { captureException } from "@sentry/nextjs";
import { notification } from "antd"

const notificationError = <T>(returnValue: T) => (e:Error, title?: string):T => {
    console.error(e);
    captureException( e )
    notification.error( { message: title ?? 'An error occurred', description: e?.message??'', duration: 20 } );
    return returnValue;
}
export default notificationError