import { SharedLayout } from "@app/client/src/components";
import { useSharedQuery, useVerifyEmailMutation } from "@app/graphql";
import { Alert, Button, Grid, TextInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import get from "lodash/get";
import React, { useEffect } from "react";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useSearchParams } from "react-router-dom";

const Verify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "";
  const token = searchParams.get("token") || "";
  const [error, setError] = React.useState<Error | null>(null);
  const [verifyEmail] = useVerifyEmailMutation();
  const [state, setState] = React.useState<
    "PENDING" | "SUBMITTING" | "SUCCESS"
  >(id && token ? "SUBMITTING" : "PENDING");

  console.log("id, token", id, token);
  const form = useForm({
    initialValues: {
      token: token,
    },
  });

  useEffect(() => {
    if (state === "SUBMITTING") {
      setError(null);
      verifyEmail({
        variables: {
          id,
          token,
        },
      })
        .then((result) => {
          if (get(result, "data.verifyEmail.success")) {
            setState("SUCCESS");
          } else {
            setState("PENDING");
            setError(new Error("Incorrect token, please check and try again"));
          }
        })
        .catch((e: Error) => {
          setError(e);
          setState("PENDING");
        });
    }
  }, [id, token, state, verifyEmail]);

  function renderForm() {
    return (
      <form onSubmit={form.onSubmit(() => setState("SUBMITTING"))}>
        <p>Please enter your email verification code</p>
        <TextInput {...form.getInputProps("token")} />
        {error ? <p>{error.message || error}</p> : null}
        <Button type={"submit"}>Submit</Button>
      </form>
    );
  }
  const query = useSharedQuery();

  return (
    <SharedLayout title="Verify Email Address" query={query}>
      <Grid>
        <Grid.Col>
          {state === "PENDING" ? (
            renderForm()
          ) : state === "SUBMITTING" ? (
            "Submitting..."
          ) : state === "SUCCESS" ? (
            <Alert
              color={"teal"}
              icon={<AiOutlineCheckCircle />}
              title="Email Verified"
            >
              Thank you for verifying your email address. You may now close this
              window.
            </Alert>
          ) : (
            "Unknown state"
          )}
        </Grid.Col>
      </Grid>
    </SharedLayout>
  );
};
export default Verify;
