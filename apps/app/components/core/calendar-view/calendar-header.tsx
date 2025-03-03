import { Popover, Transition } from "@headlessui/react";
import {
  addMonths,
  addSevenDaysToDate,
  formatDate,
  getCurrentWeekEndDate,
  getCurrentWeekStartDate,
  isSameMonth,
  isSameYear,
  lastDayOfWeek,
  startOfWeek,
  subtract7DaysToDate,
  subtractMonths,
  updateDateWithMonth,
  updateDateWithYear,
} from "helpers/calendar.helper";
import React from "react";
import { MONTHS_LIST, YEARS_LIST } from "constants/calendar";

import { ICalendarRange } from "types";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { CustomMenu, ToggleSwitch } from "components/ui";

type Props = {
  isMonthlyView: boolean;
  setIsMonthlyView: React.Dispatch<React.SetStateAction<boolean>>;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  setCalendarDateRange: React.Dispatch<React.SetStateAction<ICalendarRange>>;
  showWeekEnds: boolean;
  setShowWeekEnds: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CalendarHeader: React.FC<Props> = ({
  setIsMonthlyView,
  isMonthlyView,
  currentDate,
  setCurrentDate,
  setCalendarDateRange,
  showWeekEnds,
  setShowWeekEnds,
}) => {
  const updateDate = (date: Date) => {
    setCurrentDate(date);

    setCalendarDateRange({
      startDate: startOfWeek(date),
      endDate: lastDayOfWeek(date),
    });
  };
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="relative flex h-full w-full items-center justify-start gap-2 text-sm ">
        <Popover className="flex h-full items-center justify-start rounded-lg">
          {({ open }) => (
            <>
              <Popover.Button className={`group flex h-full items-start gap-1 text-brand-base`}>
                <div className="flex  items-center   justify-center gap-2 text-2xl font-semibold">
                  <span>{formatDate(currentDate, "Month")}</span>{" "}
                  <span>{formatDate(currentDate, "yyyy")}</span>
                </div>
              </Popover.Button>

              <Transition
                as={React.Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute top-10 left-0 z-20 flex w-full max-w-xs transform flex-col overflow-hidden rounded-[10px] bg-brand-surface-2 shadow-lg">
                  <div className="flex items-center justify-center gap-5 px-2 py-2 text-sm">
                    {YEARS_LIST.map((year) => (
                      <button
                        onClick={() => updateDate(updateDateWithYear(year.label, currentDate))}
                        className={` ${
                          isSameYear(year.value, currentDate)
                            ? "text-sm font-medium text-brand-base"
                            : "text-xs text-brand-secondary "
                        } hover:text-sm hover:font-medium hover:text-brand-base`}
                      >
                        {year.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4  border-t border-brand-base px-2">
                    {MONTHS_LIST.map((month) => (
                      <button
                        onClick={() => updateDate(updateDateWithMonth(`${month.value}`, currentDate))}
                        className={`px-2 py-2 text-xs text-brand-secondary hover:font-medium hover:text-brand-base ${
                          isSameMonth(`${month.value}`, currentDate) ? "font-medium text-brand-base" : ""
                        }`}
                      >
                        {month.label}
                      </button>
                    ))}
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>

        <div className="flex items-center gap-2">
          <button
            className="cursor-pointer"
            onClick={() => {
              if (isMonthlyView) {
                updateDate(subtractMonths(currentDate, 1));
              } else {
                setCurrentDate(subtract7DaysToDate(currentDate));
                setCalendarDateRange({
                  startDate: getCurrentWeekStartDate(subtract7DaysToDate(currentDate)),
                  endDate: getCurrentWeekEndDate(subtract7DaysToDate(currentDate)),
                });
              }
            }}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => {
              if (isMonthlyView) {
                updateDate(addMonths(currentDate, 1));
              } else {
                setCurrentDate(addSevenDaysToDate(currentDate));
                setCalendarDateRange({
                  startDate: getCurrentWeekStartDate(addSevenDaysToDate(currentDate)),
                  endDate: getCurrentWeekEndDate(addSevenDaysToDate(currentDate)),
                });
              }
            }}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex w-full items-center justify-end gap-2">
        <button
          className="group flex cursor-pointer items-center gap-2 rounded-md border border-brand-base px-3 py-1 text-sm hover:bg-brand-surface-2 hover:text-brand-base focus:outline-none"
          onClick={() => {
            if (isMonthlyView) {
              updateDate(new Date());
            } else {
              setCurrentDate(new Date());
              setCalendarDateRange({
                startDate: getCurrentWeekStartDate(new Date()),
                endDate: getCurrentWeekEndDate(new Date()),
              });
            }
          }}
        >
          Today
        </button>

        <CustomMenu
          customButton={
            <div className="group flex cursor-pointer items-center gap-2 rounded-md border border-brand-base px-3 py-1 text-sm hover:bg-brand-surface-2 hover:text-brand-base focus:outline-none ">
              {isMonthlyView ? "Monthly" : "Weekly"}
              <ChevronDownIcon className="h-3 w-3" aria-hidden="true" />
            </div>
          }
        >
          <CustomMenu.MenuItem
            onClick={() => {
              setIsMonthlyView(true);
              setCalendarDateRange({
                startDate: startOfWeek(currentDate),
                endDate: lastDayOfWeek(currentDate),
              });
            }}
            className="w-52 text-sm text-brand-secondary"
          >
            <div className="flex w-full max-w-[260px] items-center justify-between gap-2">
              <span className="flex items-center gap-2">Monthly View</span>
              <CheckIcon
                className={`h-4 w-4 flex-shrink-0 ${isMonthlyView ? "opacity-100" : "opacity-0"}`}
              />
            </div>
          </CustomMenu.MenuItem>
          <CustomMenu.MenuItem
            onClick={() => {
              setIsMonthlyView(false);
              setCalendarDateRange({
                startDate: getCurrentWeekStartDate(currentDate),
                endDate: getCurrentWeekEndDate(currentDate),
              });
            }}
            className="w-52 text-sm text-brand-secondary"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="flex items-center gap-2">Weekly View</span>
              <CheckIcon
                className={`h-4 w-4 flex-shrink-0 ${isMonthlyView ? "opacity-0" : "opacity-100"}`}
              />
            </div>
          </CustomMenu.MenuItem>
          <div className="mt-1 flex w-52 items-center justify-between border-t border-brand-base py-2 px-1  text-sm text-brand-secondary">
            <h4>Show weekends</h4>
            <ToggleSwitch value={showWeekEnds} onChange={() => setShowWeekEnds(!showWeekEnds)} />
          </div>
        </CustomMenu>
      </div>
    </div>
  );
};

export default CalendarHeader;
