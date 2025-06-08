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
        const appointments = await resp.json();
        console.log(appointments);

        setAppointments(
          (appointments as Appointment[])
            .map((a) => ({
              ...a,
              start: new Date(a.start),
              end: new Date(a.end),
            }))
            .sort((first, second) => {
              return first.start.getTime() - second.start.getTime();
            })
        );
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
    (a.start.getHours() - 6) * 64 + (a.start.getMinutes() / 60) * 64 + 8;

  const getAppointmentBoxHeight = (a: Appointment) => {
    return (
      (a.end.getHours() - a.start.getHours()) * 64 +
      ((a.end.getMinutes() - a.start.getMinutes()) / 60) * 64 +
      8
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
      <aside className="absolute h-full max-w-[500px] w-fit flex flex-col px-2 pt-3 pb-3 gap-2 justify-between bg-slate-800 rounded-r-2xl">
        <div className="flex justify-around">
          <Button
            text={"◀"}
            aria-label="to previous day"
            onClick={prevDay}
          ></Button>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date ?? new Date(Date.now()))}
          ></DatePicker>
          <Button
            text={"▶"}
            aria-label="to next day"
            onClick={nextDay}
          ></Button>
        </div>
        <div className="overflow-y-auto p-2 grid grid-cols-[min-content_1fr] gap-x-0.5 h-full relative box-content border-2 border-slate-300 rounded">
          {Array.from({ length: 16 }).map((_, idx) => {
            return (
              <div className="contents" key={Math.random().toString()}>
                <span className="inline-block text-sm text-right align-text-bottom h-16">
                  {`${(idx + 6).toString().padStart(2, "0")}:00`}
                </span>
                <div className="border-t-2 border-t-slate-200 border-dotted w-xs"></div>
              </div>
            );
          })}
          {!isLoading &&
            appointments
              .filter((a) => isSameDay(a.start, selectedDate))
              .map((a) => {
                return (
                  <div
                    key={a.id}
                    className={`col-start-2 col-span-1 absolute bg-amber-700 p-1 rounded-xl align-top w-full cursor-pointer`}
                    style={{
                      top: `${getAppointmentBoxTop(a)}px`,
                      height: `${getAppointmentBoxHeight(a)}px`,
                    }}
                    onClick={() => openDetails(a.id)}
                  >
                    {a.title}
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
