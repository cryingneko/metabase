import { screen } from "__support__/ui";
import {
  createMockGroup,
  createMockSettingDefinition,
  createMockSettings,
  createMockTokenFeatures,
} from "metabase-types/api/mocks";
import { setupGroupsEndpoint } from "__support__/server-mocks";
import { setup, SetupOpts } from "./setup";

const setupPremium = (opts?: SetupOpts) => {
  setupGroupsEndpoint([createMockGroup()]);
  setup({
    ...opts,
    tokenFeatures: createMockTokenFeatures({
      sso_saml: true,
    }),
    hasEnterprisePlugins: true,
  });
};

describe("SettingsEditorApp", () => {
  it("shows SAML auth option", async () => {
    setupPremium({
      initialRoute: "/admin/settings/authentication",
    });

    expect(await screen.findByText("SAML")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Allows users to login via a SAML Identity Provider.",
      ),
    ).toBeInTheDocument();
  });

  it("lets users access SAML settings", async () => {
    setupPremium({
      initialRoute: "/admin/settings/authentication/saml",
    });

    expect(
      await screen.findByText("Set up SAML-based SSO"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Configure your identity provider (IdP)"),
    ).toBeInTheDocument();
  });

  it("shows the admin sso notification setting", async () => {
    setupPremium({
      initialRoute: "/admin/settings/authentication",
      settingValues: createMockSettings({ "saml-enabled": true }),
    });

    expect(
      await screen.findByText("Notify admins of new SSO users"),
    ).toBeInTheDocument();
  });

  it("shows proper message when using environment variables for settings", async () => {
    setupPremium({
      initialRoute: "/admin/settings/authentication/saml",
      settings: [
        createMockSettingDefinition({
          key: "saml-identity-provider-uri",
          is_env_setting: true,
          default: "Using value of env var $MB_SAML_IDENTITY_PROVIDER_URI",
        }),
      ],
    });

    expect(
      await screen.findByLabelText("SAML Identity Provider URL"),
    ).toHaveValue("Using value of env var $MB_SAML_IDENTITY_PROVIDER_URI");
  });
});
