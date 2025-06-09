import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { API_BASE } from "../constants";
import type { Appointment } from "../types";
import AppointmentDialog from "./AppointmentDialog";
import Button from "./Button";

/**
 * This component contains graphics for the actual sidebar with the date picker and appointment boxes
 */
const Calendar: FunctionComponent = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [overlapGroups, setOverlapGroups] = useState<Appointment[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(Date.now()));
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [appointmentId, setAppointmentId] = useState<number>(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Would rather use tanstack query + axios, with queries/mutations generated with orval
        //   For simplicity's sake, here I'm using plain fetch
        //   Also, the API url base could be set externally e.g. using .env
        const resp = await fetch(new URL("/appointments/", API_BASE));

        if (!resp.ok) {
          throw Error(`Server responded with error code ${resp.status}`);
        }
        const appointmentsRaw = await resp.json();
        console.log(appointmentsRaw);

        const appointments = (appointmentsRaw as Appointment[])
          .map((a) => ({
            ...a,
            start: new Date(a.start),
            end: new Date(a.end),
          }))
          .sort((first, second) => {
            return first.start.getTime() - second.start.getTime();
          });

        setAppointments(appointments);

        const overlaps: Appointment[][] = [];

        const doesOverlap = (a: Appointment, b: Appointment) => {
          return (
            a.start.getTime() < b.end.getTime() &&
            a.end.getTime() > b.start.getTime()
          );
        };

        appointments.forEach((a) => {
          if (!overlaps.length) {
            overlaps.push([a]);
            return;
          }

          const last = overlaps.pop();
          if (last?.find((l) => doesOverlap(l, a))) {
            last.push(a);
            overlaps.push(last);
            return;
          }

          if (last) {
            overlaps.push(last);
          }
          overlaps.push([a]);
        });

        setOverlapGroups(overlaps);

        setIsLoading(false);
      } catch (error) {
        // In a real world project, the error would be forwarded to an error boundary
        console.error(error);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    setSelectedDate(
      appointments.find(({ start }) => start.getTime() >= Date.now())?.start ??
        new Date(Date.now())
    );
  }, [appointments]);

  const getAppointmentBoxTop = (a: Appointment) =>
    (a.start.getHours() - 5) * 64 + (a.start.getMinutes() / 60) * 64 - 26;

  const getAppointmentBoxHeight = (a: Appointment) => {
    return (
      (a.end.getHours() - a.start.getHours()) * 64 +
      ((a.end.getMinutes() - a.start.getMinutes()) / 60) * 64
    );
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const openDetails = useCallback((id: number) => {
    setAppointmentId(id);

    dialogRef.current?.showModal();
  }, []);

  const nextDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  }, [selectedDate]);

  const prevDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  }, [selectedDate]);

  return (
    <>
      <AppointmentDialog
        ref={dialogRef}
        appointmentId={appointmentId}
      ></AppointmentDialog>
      <aside className="absolute h-full max-w-[500px] w-fit flex flex-col px-2 pt-3 pb-3 gap-2 justify-between rounded-r-2xl bg-sky-50 dark:bg-zinc-800">
        <div className="flex justify-around">
          <Button
            text={"◀"}
            aria-label="to previous day"
            onClick={prevDay}
          ></Button>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date ?? new Date(Date.now()))}
            title="pick date"
          ></DatePicker>
          <Button
            text={"▶"}
            aria-label="to next day"
            onClick={nextDay}
          ></Button>
        </div>
        <div className="overflow-y-auto p-2 grid grid-cols-[min-content_1fr] gap-x-0.5 h-full relative box-content border-2 border-blue-300 dark:border-zinc-700 rounded">
          {Array.from({ length: 16 }).map((_, idx) => {
            return (
              <div
                className="contents box-border"
                key={Math.random().toString()}
              >
                <div className="flex justify-end text-sm h-16">
                  <span className="my-auto">{`${(idx + 6)
                    .toString()
                    .padStart(2, "0")}:00`}</span>
                </div>
                <div className="grid grid-rows-2 divide-y-2 dark:divide-zinc-700 divide-blue-300 divide-dotted w-xs box-border">
                  {/* These empty divs are needed for the dividers */}
                  <div></div>
                  <div></div>
                </div>
              </div>
            );
          })}
          {!isLoading &&
            // TODO: As of yet, this doesn't really deal with appointments spanning multiple days
            overlapGroups
              .filter(([a]) => isSameDay(a.start, selectedDate))
              .map((g) => {
                const disp = g[0];

                return (
                  <div
                    className="w-full col-start-2 col-span-1 absolute flex mx-1"
                    style={{
                      top: `${getAppointmentBoxTop(disp)}px`,
                      height: `${getAppointmentBoxHeight(disp)}px`,
                    }}
                    key={disp.id}
                  >
                    <div
                      className={`bg-sky-300 text-sky-900 dark:bg-sky-700 dark:text-sky-100 font-bold p-1 rounded-xl align-top cursor-pointer w-full`}
                      onClick={() => openDetails(disp.id)}
                    >
                      {disp.title}
                    </div>
                    <div
                      className={`${
                        g.length > 1 ? "block" : "hidden"
                      } w-fit m-auto bg-blue-400/50 opacity-90 rounded font-bold p-3`}
                    >
                      {`+${g.length - 1}`}
                    </div>
                  </div>
                );
              })}
        </div>
        <div className="flex justify-end">
          <Button
            text="New appointment"
            aria-label="new appointment"
            onClick={() => alert("Not implemented!")}
          ></Button>
        </div>
      </aside>
    </>
  );
};

export default Calendar;
