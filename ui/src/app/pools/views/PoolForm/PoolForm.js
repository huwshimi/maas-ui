import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import React, { useState } from "react";

import { resourcepool as poolActions } from "app/base/actions";
import poolSelectors from "app/store/resourcepool/selectors";
import { useAddMessage } from "app/base/hooks";
import { useWindowTitle } from "app/base/hooks";
import FormCard from "app/base/components/FormCard";
import FormikForm from "app/base/components/FormikForm";
import FormikField from "app/base/components/FormikField";
import FormCardButtons from "app/base/components/FormCardButtons";

const PoolSchema = Yup.object().shape({
  name: Yup.string().required("name is required"),
  description: Yup.string(),
});

export const PoolForm = ({ pool }) => {
  const dispatch = useDispatch();
  const saved = useSelector(poolSelectors.saved);
  const saving = useSelector(poolSelectors.saving);
  const errors = useSelector(poolSelectors.errors);
  const [savingPool, setSaving] = useState();

  useAddMessage(
    saved,
    poolActions.cleanup,
    `${savingPool} ${pool ? "updated" : "added"} successfully.`,
    setSaving
  );

  let initialValues;
  let title;
  if (pool) {
    title = "Edit pool";
    initialValues = {
      name: pool.name,
      description: pool.description,
    };
  } else {
    title = "Add pool";
    initialValues = {
      name: "",
      description: "",
    };
  }

  useWindowTitle(title);

  return (
    <FormCard sidebar={false} title={title}>
      <FormikForm
        buttons={FormCardButtons}
        errors={errors}
        cleanup={poolActions.cleanup}
        initialValues={initialValues}
        submitLabel="Save pool"
        onSaveAnalytics={{
          action: "Saved",
          category: "Resource pool",
          label: "Add pool form",
        }}
        onSubmit={(values) => {
          dispatch(poolActions.cleanup());
          if (pool) {
            values.id = pool.id;
            dispatch(poolActions.update(values));
          } else {
            dispatch(poolActions.create(values));
          }
          setSaving(values.name);
        }}
        saving={saving}
        saved={saved}
        savedRedirect="/pools"
        validationSchema={PoolSchema}
      >
        <FormikField type="text" name="name" label="Name (required)" />
        <FormikField type="text" name="description" label="Description" />
      </FormikForm>
    </FormCard>
  );
};

export default PoolForm;
