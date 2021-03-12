import { LinkMonitoring } from "./types";
import { getFirstSelected, getValidNics, preparePayload } from "./utils";

import {
  BondLacpRate,
  BondMode,
  BondXmitHashPolicy,
} from "app/store/general/types";
import {
  NetworkInterfaceTypes,
  NetworkLinkMode,
} from "app/store/machine/types";
import {
  machineDetails as machineDetailsFactory,
  machineInterface as machineInterfaceFactory,
  networkLink as networkLinkFactory,
} from "testing/factories";

describe("BondForm utils", () => {
  describe("getFirstSelected", () => {
    it("sorts the nics by name and gets the first interface", () => {
      const interfaces = [
        machineInterfaceFactory({
          name: "bbb",
        }),
        machineInterfaceFactory({
          name: "ccc",
        }),
        machineInterfaceFactory({
          name: "aaa",
        }),
      ];
      const machine = machineDetailsFactory({
        interfaces,
      });
      expect(
        getFirstSelected(machine, [
          { nicId: interfaces[0].id },
          { nicId: interfaces[1].id },
          { nicId: interfaces[2].id },
        ])
      ).toStrictEqual({ nicId: interfaces[2].id });
    });
  });

  describe("getValidNics", () => {
    it("gets interfaces without an existing bond", () => {
      const interfaces = [
        machineInterfaceFactory({
          type: NetworkInterfaceTypes.PHYSICAL,
          vlan_id: 1,
        }),
        // Invalid because it has a different VLAN.
        machineInterfaceFactory({
          type: NetworkInterfaceTypes.PHYSICAL,
          vlan_id: 2,
        }),
        machineInterfaceFactory({
          type: NetworkInterfaceTypes.PHYSICAL,
          vlan_id: 1,
        }),
        // Invalid because it is not physical.
        machineInterfaceFactory({
          type: NetworkInterfaceTypes.VLAN,
          vlan_id: 1,
        }),
        // Invalid because it is already in a bond
        machineInterfaceFactory({
          children: [9],
          type: NetworkInterfaceTypes.PHYSICAL,
          vlan_id: 1,
        }),
      ];
      const machine = machineDetailsFactory({
        interfaces,
      });
      expect(getValidNics(machine, 1)).toStrictEqual([
        interfaces[0],
        interfaces[2],
      ]);
    });

    it("gets physical interfaces in the same vlan", () => {
      const interfaces = [
        // This is the bond
        machineInterfaceFactory({
          id: 8,
          type: NetworkInterfaceTypes.BOND,
          vlan_id: 1,
        }),
        // Valid because it is not in a bond.
        machineInterfaceFactory({
          type: NetworkInterfaceTypes.PHYSICAL,
          vlan_id: 1,
        }),
        // Valid because it is in the bond.
        machineInterfaceFactory({
          type: NetworkInterfaceTypes.PHYSICAL,
          vlan_id: 1,
        }),
        // Invalid because it is in a different bond.
        machineInterfaceFactory({
          children: [9],
          type: NetworkInterfaceTypes.PHYSICAL,
          vlan_id: 1,
        }),
      ];
      const machine = machineDetailsFactory({
        interfaces,
      });
      expect(getValidNics(machine, 1, interfaces[0])).toStrictEqual([
        interfaces[1],
        interfaces[2],
      ]);
    });
  });

  describe("preparePayload", () => {
    it("cleans and prepares the payload with a nic and link", () => {
      const nic = machineInterfaceFactory();
      const link = networkLinkFactory();
      const values = {
        // Should be removed.
        linkMonitoring: LinkMonitoring.MII,
        // Should be removed.
        mac_address: "",
        // Should not be removed,
        bond_downdelay: 0,
        bond_lacp_rate: BondLacpRate.FAST,
        bond_mode: BondMode.ACTIVE_BACKUP,
        bond_miimon: 20,
        bond_updelay: 30,
        bond_xmit_hash_policy: BondXmitHashPolicy.ENCAP2_3,
        fabric: 1,
        ip_address: "1.2.3.4",
        mode: NetworkLinkMode.LINK_UP,
        name: "bond2",
        subnet: 1,
        tags: ["a", "tag"],
        vlan: 1,
      };
      expect(
        preparePayload(
          values,
          [{ nicId: 1 }, { nicId: 2 }],
          "abc123",
          nic,
          link
        )
      ).toStrictEqual({
        bond_downdelay: 0,
        bond_lacp_rate: BondLacpRate.FAST,
        bond_mode: BondMode.ACTIVE_BACKUP,
        bond_miimon: 20,
        bond_updelay: 30,
        bond_xmit_hash_policy: BondXmitHashPolicy.ENCAP2_3,
        fabric: 1,
        ip_address: "1.2.3.4",
        mode: NetworkLinkMode.LINK_UP,
        name: "bond2",
        subnet: 1,
        tags: ["a", "tag"],
        vlan: 1,
        // The following fields should be appended.
        interface_id: nic.id,
        link_id: link.id,
        parents: [1, 2],
        system_id: "abc123",
      });
    });

    it("can ignore the nic and link if not provided", () => {
      const values = {
        linkMonitoring: LinkMonitoring.MII,
        mac_address: "",
        bond_downdelay: 0,
        bond_lacp_rate: BondLacpRate.FAST,
        bond_mode: BondMode.ACTIVE_BACKUP,
        bond_miimon: 20,
        bond_updelay: 30,
        bond_xmit_hash_policy: BondXmitHashPolicy.ENCAP2_3,
        fabric: 1,
        ip_address: "1.2.3.4",
        mode: NetworkLinkMode.LINK_UP,
        name: "bond2",
        subnet: 1,
        tags: ["a", "tag"],
        vlan: 1,
      };
      const payload = preparePayload(values, [], "abc123");
      expect(payload.link_id).toBeUndefined();
      expect(payload.interface_id).toBeUndefined();
    });
  });
});
