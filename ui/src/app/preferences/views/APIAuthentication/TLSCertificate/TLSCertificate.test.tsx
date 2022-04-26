import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fileDownload from "js-file-download";

import TLSCertificate, { Labels } from "./TLSCertificate";

import {
  generalState as generalStateFactory,
  rootState as rootStateFactory,
  tlsCertificate as tlsCertificateFactory,
  tlsCertificateState as tlsCertificateStateFactory,
} from "testing/factories";
import { renderWithMockStore } from "testing/utils";

jest.mock("js-file-download", () => jest.fn());

afterEach(() => {
  jest.restoreAllMocks();
});

it("does not render if there is no TLS certificate", () => {
  const state = rootStateFactory({
    general: generalStateFactory({
      tlsCertificate: tlsCertificateStateFactory({
        data: null,
        loaded: true,
      }),
    }),
  });
  const { container } = renderWithMockStore(<TLSCertificate />, { state });

  expect(container).toBeEmptyDOMElement();
});

it("renders TLS certificate data if it exists", () => {
  const tlsCertificate = tlsCertificateFactory();
  const state = rootStateFactory({
    general: generalStateFactory({
      tlsCertificate: tlsCertificateStateFactory({
        data: tlsCertificate,
        loaded: true,
      }),
    }),
  });
  renderWithMockStore(<TLSCertificate />, { state });

  expect(screen.getByText(tlsCertificate.fingerprint)).toBeInTheDocument();
});

it("can generate a download based on the TLS certificate details", async () => {
  const downloadSpy = jest.spyOn(fileDownload, "default");
  const tlsCertificate = tlsCertificateFactory();
  const state = rootStateFactory({
    general: generalStateFactory({
      tlsCertificate: tlsCertificateStateFactory({
        data: tlsCertificate,
        loaded: true,
      }),
    }),
  });
  renderWithMockStore(<TLSCertificate />, { state });

  userEvent.click(screen.getByRole("button", { name: Labels.Download }));

  await waitFor(() => {
    expect(downloadSpy).toHaveBeenCalledWith(
      tlsCertificate.certificate,
      Labels.Filename
    );
  });
});