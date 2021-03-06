import { Button, Col, Input, Row } from "@canonical/react-components";
import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";

import { formatMacAddress } from "app/utils";
import ArchitectureSelect from "app/base/components/ArchitectureSelect";
import DomainSelect from "app/base/components/DomainSelect";
import FormikField from "app/base/components/FormikField";
import MinimumKernelSelect from "app/base/components/MinimumKernelSelect";
import generalSelectors from "app/store/general/selectors";
import PowerTypeFields from "app/machines/components/PowerTypeFields";
import ResourcePoolSelect from "app/base/components/ResourcePoolSelect";
import ZoneSelect from "app/base/components/ZoneSelect";

export const AddMachineFormFields = ({ saved }) => {
  const powerTypes = useSelector(generalSelectors.powerTypes.get);

  const [extraMACs, setExtraMACs] = useState([]);

  const formikProps = useFormikContext();
  const { errors, setFieldValue, values } = formikProps;

  useEffect(() => {
    if (saved) {
      setExtraMACs([]);
    }
  }, [saved]);

  const macAddressRequired = values.power_type !== "ipmi";

  return (
    <Row>
      <Col size="5">
        <FormikField
          label="Machine name"
          name="hostname"
          placeholder="Machine name (optional)"
          type="text"
        />
        <DomainSelect name="domain" required />
        <ArchitectureSelect name="architecture" required />
        <MinimumKernelSelect name="min_hwe_kernel" />
        <ZoneSelect name="zone" required />
        <ResourcePoolSelect name="pool" required />
        <FormikField
          label="MAC address"
          maxLength="17"
          name="pxe_mac"
          onChange={(e) => {
            setFieldValue("pxe_mac", formatMacAddress(e.target.value));
          }}
          placeholder="00:00:00:00:00:00"
          required={macAddressRequired}
          type="text"
        />
        {extraMACs.map((mac, i) => (
          <div
            className="p-input--closeable"
            data-test={`extra-macs-${i}`}
            key={`extra-macs-${i}`}
          >
            <Input
              error={errors?.extra_macs && errors.extra_macs[i]}
              maxLength="17"
              onChange={(e) => {
                const newExtraMACs = [...extraMACs];
                newExtraMACs[i] = formatMacAddress(e.target.value);
                setExtraMACs(newExtraMACs);
                setFieldValue("extra_macs", newExtraMACs);
              }}
              placeholder="00:00:00:00:00:00"
              type="text"
              value={mac}
            />
            <Button
              className="p-close-input"
              hasIcon
              onClick={() => {
                const newExtraMACs = extraMACs.filter((_, j) => j !== i);
                setExtraMACs(newExtraMACs);
                setFieldValue("extra_macs", newExtraMACs);
              }}
              type="button"
            >
              <i className="p-icon--close" />
            </Button>
          </div>
        ))}
        <div className="u-align--right">
          <Button
            data-test="add-extra-mac"
            hasIcon
            onClick={() => setExtraMACs([...extraMACs, ""])}
            type="button"
          >
            <i className="p-icon--plus" />
            <span>Add MAC address</span>
          </Button>
        </div>
      </Col>
      <Col size="5">
        <PowerTypeFields
          driverType="node"
          formikProps={formikProps}
          powerTypes={powerTypes}
          selectedPowerType={values.power_type}
        />
      </Col>
    </Row>
  );
};

export default AddMachineFormFields;
