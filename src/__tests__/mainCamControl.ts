import { createMediaStreamMock } from 'webrtc-mock';
import createSipConnector from '../__mocks__/doMock';
import { dataForConnectionWithAuthorization } from '../__mocks__';
import JsSIP from '../__mocks__/jssip.mock';
import SipConnector, { EEventsMainCAM } from '../SipConnector';
import {
  HEADER_CONTENT_TYPE_NAME,
  CONTENT_TYPE_MAIN_CAM,
  HEADER_MAIN_CAM,
  HEADER_MAIN_CAM_RESOLUTION,
} from '../headers';

const headersMainCamControl = [
  [HEADER_CONTENT_TYPE_NAME, CONTENT_TYPE_MAIN_CAM],
  [HEADER_MAIN_CAM, EEventsMainCAM.MAX_MAIN_CAM_RESOLUTION],
  [HEADER_MAIN_CAM_RESOLUTION, '720'],
];

const headersAdminStartMainCam = [
  [HEADER_CONTENT_TYPE_NAME, CONTENT_TYPE_MAIN_CAM],
  [HEADER_MAIN_CAM, EEventsMainCAM.ADMIN_START_MAIN_CAM],
];

const headersAdminStopMainCam = [
  [HEADER_CONTENT_TYPE_NAME, CONTENT_TYPE_MAIN_CAM],
  [HEADER_MAIN_CAM, EEventsMainCAM.ADMIN_STOP_MAIN_CAM],
];

describe('main cam control', () => {
  const number = '111';

  let sipConnector: SipConnector;
  let mediaStream;

  beforeEach(() => {
    sipConnector = createSipConnector();
    mediaStream = createMediaStreamMock({
      audio: { deviceId: { exact: 'audioDeviceId' } },
      video: { deviceId: { exact: 'videoDeviceId' } },
    });
  });

  it('event', async () => {
    await sipConnector.connect(dataForConnectionWithAuthorization);
    await sipConnector.call({ number, mediaStream });

    const promise = new Promise<{ mainCam: EEventsMainCAM; resolutionMainCam: string }>(
      (resolve) => {
        return sipConnector.onSession('main-cam-control', resolve);
      }
    );
    const { session } = sipConnector;

    if (session) {
      JsSIP.triggerNewInfo(session, headersMainCamControl);
    }

    return promise.then(({ mainCam, resolutionMainCam }) => {
      expect(mainCam).toBe(EEventsMainCAM.MAX_MAIN_CAM_RESOLUTION);
      expect(resolutionMainCam).toBe('720');
    });
  });

  it('admin start main cam', async () => {
    await sipConnector.connect(dataForConnectionWithAuthorization);
    await sipConnector.call({ number, mediaStream });

    const promise = new Promise<{ mainCam: EEventsMainCAM }>((resolve) => {
      return sipConnector.onSession('admin-start-main-cam', resolve);
    });
    const { session } = sipConnector;

    if (session) {
      JsSIP.triggerNewInfo(session, headersAdminStartMainCam);
    }

    return promise.then((data) => {
      expect(data).toBe(undefined);
    });
  });

  it('admin stop main cam', async () => {
    await sipConnector.connect(dataForConnectionWithAuthorization);
    await sipConnector.call({ number, mediaStream });

    const promise = new Promise<{ mainCam: EEventsMainCAM }>((resolve) => {
      return sipConnector.onSession('admin-stop-main-cam', resolve);
    });
    const { session } = sipConnector;

    if (session) {
      JsSIP.triggerNewInfo(session, headersAdminStopMainCam);
    }

    return promise.then((data) => {
      expect(data).toBe(undefined);
    });
  });
});
