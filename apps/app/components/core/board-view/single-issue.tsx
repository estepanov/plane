import React, { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { mutate } from "swr";

// react-beautiful-dnd
import {
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";
// services
import issuesService from "services/issues.service";
// hooks
import useIssuesView from "hooks/use-issues-view";
import useToast from "hooks/use-toast";
// components
import {
  ViewAssigneeSelect,
  ViewDueDateSelect,
  ViewEstimateSelect,
  ViewPrioritySelect,
  ViewStateSelect,
} from "components/issues";
// ui
import { ContextMenu, CustomMenu, Tooltip } from "components/ui";
// icons
import {
  ClipboardDocumentCheckIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
// helpers
import { handleIssuesMutation } from "constants/issue";
import { copyTextToClipboard, truncateText } from "helpers/string.helper";
// types
import { IIssue, Properties, TIssueGroupByOptions, UserAuth } from "types";
// fetch-keys
import {
  CYCLE_DETAILS,
  CYCLE_ISSUES_WITH_PARAMS,
  MODULE_DETAILS,
  MODULE_ISSUES_WITH_PARAMS,
  PROJECT_ISSUES_LIST_WITH_PARAMS,
} from "constants/fetch-keys";

type Props = {
  type?: string;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  issue: IIssue;
  properties: Properties;
  groupTitle?: string;
  index: number;
  selectedGroup: TIssueGroupByOptions;
  editIssue: () => void;
  makeIssueCopy: () => void;
  removeIssue?: (() => void) | null;
  handleDeleteIssue: (issue: IIssue) => void;
  handleTrashBox: (isDragging: boolean) => void;
  isCompleted?: boolean;
  userAuth: UserAuth;
};

export const SingleBoardIssue: React.FC<Props> = ({
  type,
  provided,
  snapshot,
  issue,
  properties,
  index,
  selectedGroup,
  editIssue,
  makeIssueCopy,
  removeIssue,
  groupTitle,
  handleDeleteIssue,
  handleTrashBox,
  isCompleted = false,
  userAuth,
}) => {
  // context menu
  const [contextMenu, setContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const { orderBy, params } = useIssuesView();

  const router = useRouter();
  const { workspaceSlug, projectId, cycleId, moduleId } = router.query;

  const { setToastAlert } = useToast();

  const partialUpdateIssue = useCallback(
    (formData: Partial<IIssue>, issueId: string) => {
      if (!workspaceSlug || !projectId) return;

      if (cycleId)
        mutate<
          | {
              [key: string]: IIssue[];
            }
          | IIssue[]
        >(
          CYCLE_ISSUES_WITH_PARAMS(cycleId as string, params),
          (prevData) =>
            handleIssuesMutation(
              formData,
              groupTitle ?? "",
              selectedGroup,
              index,
              orderBy,
              prevData
            ),
          false
        );
      else if (moduleId)
        mutate<
          | {
              [key: string]: IIssue[];
            }
          | IIssue[]
        >(
          MODULE_ISSUES_WITH_PARAMS(moduleId as string),
          (prevData) =>
            handleIssuesMutation(
              formData,
              groupTitle ?? "",
              selectedGroup,
              index,
              orderBy,
              prevData
            ),
          false
        );
      else {
        mutate<
          | {
              [key: string]: IIssue[];
            }
          | IIssue[]
        >(
          PROJECT_ISSUES_LIST_WITH_PARAMS(projectId as string, params),
          (prevData) => {
            if (!prevData) return prevData;

            return handleIssuesMutation(
              formData,
              groupTitle ?? "",
              selectedGroup,
              index,
              orderBy,
              prevData
            );
          },
          false
        );
      }

      issuesService
        .patchIssue(workspaceSlug as string, projectId as string, issueId, formData)
        .then(() => {
          if (cycleId) {
            mutate(CYCLE_ISSUES_WITH_PARAMS(cycleId as string, params));
            mutate(CYCLE_DETAILS(cycleId as string));
          } else if (moduleId) {
            mutate(MODULE_ISSUES_WITH_PARAMS(moduleId as string, params));
            mutate(MODULE_DETAILS(moduleId as string));
          } else mutate(PROJECT_ISSUES_LIST_WITH_PARAMS(projectId as string, params));
        })
        .catch((error) => {
          console.log(error);
        });
    },
    [workspaceSlug, projectId, cycleId, moduleId, groupTitle, index, selectedGroup, orderBy, params]
  );

  const getStyle = (
    style: DraggingStyle | NotDraggingStyle | undefined,
    snapshot: DraggableStateSnapshot
  ) => {
    if (orderBy === "sort_order") return style;
    if (!snapshot.isDragging) return {};
    if (!snapshot.isDropAnimating) return style;

    return {
      ...style,
      transitionDuration: `0.001s`,
    };
  };

  const handleCopyText = () => {
    const originURL =
      typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
    copyTextToClipboard(
      `${originURL}/${workspaceSlug}/projects/${projectId}/issues/${issue.id}`
    ).then(() => {
      setToastAlert({
        type: "success",
        title: "Link Copied!",
        message: "Issue link copied to clipboard.",
      });
    });
  };

  useEffect(() => {
    if (snapshot.isDragging) handleTrashBox(snapshot.isDragging);
  }, [snapshot, handleTrashBox]);

  const isNotAllowed = userAuth.isGuest || userAuth.isViewer || isCompleted;

  return (
    <>
      <ContextMenu
        position={contextMenuPosition}
        title="Quick actions"
        isOpen={contextMenu}
        setIsOpen={setContextMenu}
      >
        {!isNotAllowed && (
          <>
            <ContextMenu.Item Icon={PencilIcon} onClick={editIssue}>
              Edit issue
            </ContextMenu.Item>
            <ContextMenu.Item Icon={ClipboardDocumentCheckIcon} onClick={makeIssueCopy}>
              Make a copy...
            </ContextMenu.Item>
            <ContextMenu.Item Icon={TrashIcon} onClick={() => handleDeleteIssue(issue)}>
              Delete issue
            </ContextMenu.Item>
          </>
        )}
        <ContextMenu.Item Icon={LinkIcon} onClick={handleCopyText}>
          Copy issue link
        </ContextMenu.Item>
        <a
          href={`/${workspaceSlug}/projects/${projectId}/issues/${issue.id}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          <ContextMenu.Item Icon={ArrowTopRightOnSquareIcon}>
            Open issue in new tab
          </ContextMenu.Item>
        </a>
      </ContextMenu>
      <div
        className={`mb-3 rounded bg-brand-base shadow ${
          snapshot.isDragging ? "border-2 border-brand-accent shadow-lg" : ""
        }`}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={getStyle(provided.draggableProps.style, snapshot)}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu(true);
          setContextMenuPosition({ x: e.pageX, y: e.pageY });
        }}
      >
        <div className="group/card relative select-none p-3.5">
          {!isNotAllowed && (
            <div className="z-1 absolute top-1.5 right-1.5 opacity-0 group-hover/card:opacity-100">
              {type && !isNotAllowed && (
                <CustomMenu width="auto" ellipsis>
                  <CustomMenu.MenuItem onClick={editIssue}>
                    <div className="flex items-center justify-start gap-2">
                      <PencilIcon className="h-4 w-4" />
                      <span>Edit issue</span>
                    </div>
                  </CustomMenu.MenuItem>
                  {type !== "issue" && removeIssue && (
                    <CustomMenu.MenuItem onClick={removeIssue}>
                      <div className="flex items-center justify-start gap-2">
                        <XMarkIcon className="h-4 w-4" />
                        <span>Remove from {type}</span>
                      </div>
                    </CustomMenu.MenuItem>
                  )}
                  <CustomMenu.MenuItem onClick={() => handleDeleteIssue(issue)}>
                    <div className="flex items-center justify-start gap-2">
                      <TrashIcon className="h-4 w-4" />
                      <span>Delete issue</span>
                    </div>
                  </CustomMenu.MenuItem>
                  <CustomMenu.MenuItem onClick={handleCopyText}>
                    <div className="flex items-center justify-start gap-2">
                      <LinkIcon className="h-4 w-4" />
                      <span>Copy issue Link</span>
                    </div>
                  </CustomMenu.MenuItem>
                </CustomMenu>
              )}
            </div>
          )}
          <Link href={`/${workspaceSlug}/projects/${issue.project}/issues/${issue.id}`}>
            <a>
              {properties.key && (
                <div className="mb-2.5 text-xs font-medium text-brand-secondary">
                  {issue.project_detail.identifier}-{issue.sequence_id}
                </div>
              )}
              <h5
                className="break-all text-sm group-hover:text-brand-accent"
                style={{ lineClamp: 3, WebkitLineClamp: 3 }}
              >
                {truncateText(issue.name, 100)}
              </h5>
            </a>
          </Link>
          <div className="relative mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            {properties.priority && (
              <ViewPrioritySelect
                issue={issue}
                partialUpdateIssue={partialUpdateIssue}
                isNotAllowed={isNotAllowed}
                selfPositioned
              />
            )}
            {properties.state && (
              <ViewStateSelect
                issue={issue}
                partialUpdateIssue={partialUpdateIssue}
                isNotAllowed={isNotAllowed}
                selfPositioned
              />
            )}
            {properties.due_date && (
              <ViewDueDateSelect
                issue={issue}
                partialUpdateIssue={partialUpdateIssue}
                isNotAllowed={isNotAllowed}
              />
            )}
            {properties.sub_issue_count && (
              <div className="flex flex-shrink-0 items-center gap-1 rounded-md border border-brand-base px-2 py-1 text-xs text-brand-secondary shadow-sm">
                {issue.sub_issues_count} {issue.sub_issues_count === 1 ? "sub-issue" : "sub-issues"}
              </div>
            )}
            {properties.labels && issue.label_details.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {issue.label_details.map((label) => (
                  <div
                    key={label.id}
                    className="group flex items-center gap-1 rounded-2xl border border-brand-base px-2 py-0.5 text-xs text-brand-secondary"
                  >
                    <span
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{
                        backgroundColor: label?.color && label.color !== "" ? label.color : "#000",
                      }}
                    />
                    {label.name}
                  </div>
                ))}
              </div>
            )}
            {properties.assignee && (
              <ViewAssigneeSelect
                issue={issue}
                partialUpdateIssue={partialUpdateIssue}
                isNotAllowed={isNotAllowed}
                tooltipPosition="left"
                selfPositioned
              />
            )}
            {properties.estimate && (
              <ViewEstimateSelect
                issue={issue}
                partialUpdateIssue={partialUpdateIssue}
                isNotAllowed={isNotAllowed}
                selfPositioned
              />
            )}
            {properties.link && (
              <div className="flex cursor-default items-center rounded-md border border-brand-base px-2.5 py-1 text-xs shadow-sm">
                <Tooltip tooltipHeading="Link" tooltipContent={`${issue.link_count}`}>
                  <div className="flex items-center gap-1 text-brand-secondary">
                    <LinkIcon className="h-3.5 w-3.5" />
                    {issue.link_count}
                  </div>
                </Tooltip>
              </div>
            )}
            {properties.attachment_count && (
              <div className="flex cursor-default items-center rounded-md border border-brand-base px-2.5 py-1 text-xs shadow-sm">
                <Tooltip tooltipHeading="Attachment" tooltipContent={`${issue.attachment_count}`}>
                  <div className="flex items-center gap-1 text-brand-secondary">
                    <PaperClipIcon className="h-3.5 w-3.5 -rotate-45" />
                    {issue.attachment_count}
                  </div>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
