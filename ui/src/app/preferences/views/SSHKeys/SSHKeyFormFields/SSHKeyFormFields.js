import { Col, Link, Row, Select, Textarea } from "@canonical/react-components";
import { useFormikContext } from "formik";
import React from "react";

import FormikField from "app/base/components/FormikField";

export const SSHKeyFormFields = () => {
  const { values } = useFormikContext();
  const { protocol } = values;
  const uploadSelected = protocol === "upload";

  return (
    <>
      <Row>
        <Col size="4">
          <FormikField
            component={Select}
            name="protocol"
            label="Source"
            options={[
              { value: "", label: "Select source" },
              { value: "lp", label: "Launchpad" },
              { value: "gh", label: "GitHub" },
              { value: "upload", label: "Upload" }
            ]}
          />
          {protocol && !uploadSelected && (
            <FormikField
              name="auth_id"
              label={protocol === "lp" ? "Launchpad ID" : "GitHub username"}
              required={true}
              type="text"
            />
          )}
          {uploadSelected && (
            <FormikField
              component={Textarea}
              name="key"
              help="Usually at ~/.ssh/id_rsa.pub, ~/.ssh/id_dsa.pub, or ~/.ssh/id_ecdsa.pub"
              label={
                <>
                  Public key{" "}
                  <span className="p-tooltip">
                    <i className="p-icon--help"></i>
                    <span className="p-tooltip__message" role="tooltip">
                      Begins with 'ssh-rsa', 'ssh-dss', 'ssh-ed25519',
                      'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', or
                      'ecdsa-sha2-nistp521'
                    </span>
                  </span>
                </>
              }
              style={{ minHeight: "10rem" }}
            />
          )}
        </Col>
        <Col size="4">
          <p className="p-form-help-text" style={{ marginTop: "0.5rem" }}>
            Before you can deploy a machine you must import at least one public
            SSH key into MAAS, so the deployed machine can be accessed.
          </p>
        </Col>
      </Row>
      <Link
        external
        href="https://maas.io/docs/user-accounts#heading--ssh-keys"
      >
        About SSH keys
      </Link>
    </>
  );
};

export default SSHKeyFormFields;
