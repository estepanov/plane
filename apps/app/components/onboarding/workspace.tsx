import { useState } from "react";

import Image from "next/image";

import useSWR from "swr";

// headless ui
import { Tab } from "@headlessui/react";
// services
import workspaceService from "services/workspace.service";
// types
import { IWorkspaceMemberInvitation } from "types";
// fetch-keys
import { USER_WORKSPACE_INVITATIONS } from "constants/fetch-keys";
// constants
import { CreateWorkspaceForm } from "components/workspace";
// ui
import { PrimaryButton } from "components/ui";

type Props = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setWorkspace: React.Dispatch<React.SetStateAction<any>>;
};

export const Workspace: React.FC<Props> = ({ setStep, setWorkspace }) => {
  const [isJoiningWorkspaces, setIsJoiningWorkspaces] = useState(false);
  const [invitationsRespond, setInvitationsRespond] = useState<string[]>([]);
  const [defaultValues, setDefaultValues] = useState({
    name: "",
    slug: "",
    company_size: null,
  });

  const { data: invitations, mutate } = useSWR(USER_WORKSPACE_INVITATIONS, () =>
    workspaceService.userWorkspaceInvitations()
  );

  const handleInvitation = (
    workspace_invitation: IWorkspaceMemberInvitation,
    action: "accepted" | "withdraw"
  ) => {
    if (action === "accepted") {
      setInvitationsRespond((prevData) => [...prevData, workspace_invitation.id]);
    } else if (action === "withdraw") {
      setInvitationsRespond((prevData) =>
        prevData.filter((item: string) => item !== workspace_invitation.id)
      );
    }
  };

  const submitInvitations = async () => {
    if (invitationsRespond.length <= 0) return;
    setIsJoiningWorkspaces(true);
    await workspaceService
      .joinWorkspaces({ invitations: invitationsRespond })
      .then(async () => {
        await mutate();
        setStep(4);
        setIsJoiningWorkspaces(false);
      })
      .catch((err) => {
        console.error(err);
        setIsJoiningWorkspaces(false);
      });
  };

  return (
    <div className="grid min-h-[490px] w-full place-items-center">
      <Tab.Group
        as="div"
        className="flex h-full w-full max-w-xl flex-col justify-between rounded-[10px] bg-brand-base shadow-md"
      >
        <Tab.List
          as="div"
          className="text-gray-8 flex items-center justify-start gap-3 px-4 pt-4 text-sm"
        >
          <Tab
            className={({ selected }) =>
              `rounded-3xl border px-4 py-2 outline-none ${
                selected
                  ? "border-brand-accent bg-brand-accent text-white"
                  : "border-brand-base bg-brand-surface-2 hover:bg-brand-surface-1"
              }`
            }
          >
            New Workspace
          </Tab>
          <Tab
            className={({ selected }) =>
              `rounded-3xl border px-5 py-2 outline-none ${
                selected
                  ? "border-brand-accent bg-brand-accent text-white"
                  : "border-brand-base bg-brand-surface-2 hover:bg-brand-surface-1"
              }`
            }
          >
            Invited Workspace
          </Tab>
        </Tab.List>
        <Tab.Panels as="div" className="h-full">
          <Tab.Panel>
            <CreateWorkspaceForm
              onSubmit={(res) => {
                setWorkspace(res);
                setStep(3);
              }}
              defaultValues={defaultValues}
              setDefaultValues={setDefaultValues}
            />
          </Tab.Panel>
          <Tab.Panel className="h-full">
            <div className="flex h-full w-full flex-col justify-between">
              <div className="divide-y px-4 py-7">
                {invitations && invitations.length > 0 ? (
                  invitations.map((invitation) => (
                    <div key={invitation.id}>
                      <label
                        className={`group relative flex cursor-pointer items-start space-x-3 border-2 border-transparent py-4`}
                        htmlFor={invitation.id}
                      >
                        <div className="flex-shrink-0">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg">
                            {invitation.workspace.logo && invitation.workspace.logo !== "" ? (
                              <Image
                                src={invitation.workspace.logo}
                                height="100%"
                                width="100%"
                                className="rounded"
                                alt={invitation.workspace.name}
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center rounded bg-gray-700 p-4 uppercase text-white">
                                {invitation.workspace.name.charAt(0)}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{invitation.workspace.name}</div>
                          <p className="text-sm text-brand-secondary">
                            Invited by {invitation.workspace.owner.first_name}
                          </p>
                        </div>
                        <div className="flex-shrink-0 self-center">
                          <input
                            id={invitation.id}
                            aria-describedby="workspaces"
                            name={invitation.id}
                            checked={invitationsRespond.includes(invitation.id)}
                            value={invitation.workspace.name}
                            onChange={(e) => {
                              handleInvitation(
                                invitation,
                                invitationsRespond.includes(invitation.id) ? "withdraw" : "accepted"
                              );
                            }}
                            type="checkbox"
                            className="h-4 w-4 rounded border-brand-base text-brand-accent focus:ring-brand-accent"
                          />
                        </div>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-center">
                    <h3 className="text-brand-secondary">{`You don't have any invitations yet.`}</h3>
                  </div>
                )}
              </div>
              <div className="flex w-full items-center justify-center rounded-b-[10px] py-7">
                <PrimaryButton
                  type="submit"
                  className="w-1/2 text-center"
                  size="md"
                  disabled={isJoiningWorkspaces || invitationsRespond.length === 0}
                  onClick={submitInvitations}
                >
                  Join Workspace
                </PrimaryButton>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
