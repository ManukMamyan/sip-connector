/// <reference types="jest" />
import { createMediaStreamMock } from 'webrtc-mock';
import type SipConnector from '../SipConnector';
import { dataForConnectionWithAuthorization } from '../__fixtures__';
import JsSIP from '../__fixtures__/jssip.mock';
import createSipConnector from '../doMock';
import {
  AVAILABLE_SECOND_REMOTE_STREAM,
  CONTENT_TYPE_SHARE_STATE,
  HEADER_CONTENT_SHARE_STATE,
  HEADER_CONTENT_TYPE_NAME,
  MUST_STOP_PRESENTATION,
  NOT_AVAILABLE_SECOND_REMOTE_STREAM,
} from '../headers';

describe('events', () => {
  const number = '111';

  let sipConnector: SipConnector;
  let mediaStream: MediaStream;

  beforeEach(() => {
    sipConnector = createSipConnector();
    mediaStream = createMediaStreamMock({
      audio: { deviceId: { exact: 'audioDeviceId' } },
      video: { deviceId: { exact: 'videoDeviceId' } },
    });
  });

  it('availableSecondRemoteStream', async () => {
    expect.assertions(1);

    const promise = new Promise((resolve) => {
      sipConnector.onSession('availableSecondRemoteStream', resolve);
    });

    await sipConnector.connect(dataForConnectionWithAuthorization);
    await sipConnector.call({ number, mediaStream });

    const extraHeaders: [string, string][] = [
      [HEADER_CONTENT_TYPE_NAME, CONTENT_TYPE_SHARE_STATE],
      [HEADER_CONTENT_SHARE_STATE, AVAILABLE_SECOND_REMOTE_STREAM],
    ];
    const { session } = sipConnector;

    if (session) {
      JsSIP.triggerNewInfo(session, extraHeaders);
    }

    return expect(promise).resolves.toBeUndefined();
  });

  it('notAvailableSecondRemoteStream', async () => {
    expect.assertions(1);

    const promise = new Promise((resolve) => {
      sipConnector.onSession('notAvailableSecondRemoteStream', resolve);
    });

    await sipConnector.connect(dataForConnectionWithAuthorization);
    await sipConnector.call({ number, mediaStream });

    const extraHeaders: [string, string][] = [
      [HEADER_CONTENT_TYPE_NAME, CONTENT_TYPE_SHARE_STATE],
      [HEADER_CONTENT_SHARE_STATE, NOT_AVAILABLE_SECOND_REMOTE_STREAM],
    ];
    const { session } = sipConnector;

    if (session) {
      JsSIP.triggerNewInfo(session, extraHeaders);
    }

    return expect(promise).resolves.toBeUndefined();
  });

  it('mustStopPresentation', async () => {
    expect.assertions(1);

    const promise = new Promise((resolve) => {
      sipConnector.onSession('mustStopPresentation', resolve);
    });

    await sipConnector.connect(dataForConnectionWithAuthorization);
    await sipConnector.call({ number, mediaStream });

    const extraHeaders: [string, string][] = [
      [HEADER_CONTENT_TYPE_NAME, CONTENT_TYPE_SHARE_STATE],
      [HEADER_CONTENT_SHARE_STATE, MUST_STOP_PRESENTATION],
    ];
    const { session } = sipConnector;

    if (session) {
      JsSIP.triggerNewInfo(session, extraHeaders);
    }

    return expect(promise).resolves.toBeUndefined();
  });
});
