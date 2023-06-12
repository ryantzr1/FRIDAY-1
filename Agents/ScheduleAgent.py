from .ConversationalAgent import ConversationalAgent
from gcsa.google_calendar import GoogleCalendar
import time
from datetime import datetime, timedelta
from gcsa.event import Event
import re
from dateutil import parser
from .PromptTemplate import PromptTemplate
from .utils import sum_dict

# TODO: Custom requirements 
# Describe company and type of appointments
# This should be in the constructor 

class ScheduleAgent(ConversationalAgent):
    '''
    Scheduling agent
    '''
    def __init__(self, company_info) -> None:
        if "schedule" not in company_info:
            self.to_schedule = False
        else:
            self.chat_history = []
            self.company_desc = company_info["company_desc"]
            self.appointment_type = company_info["scheduling"]["appointment_type"]
            self.start_time = parser.parse(company_info["scheduling"]["start_time"])
            self.end_time = parser.parse(company_info["scheduling"]["end_time"])
            self.interval = int(company_info["scheduling"]["interval"])
            self.email = company_info["scheduling"]["email"]
            self.clash_condition = int(company_info["scheduling"]["clash_condition"])
            self.fields_required = company_info["scheduling"]["fields_required"]
            self.event_type = company_info["scheduling"]["event_type"]
            self.event_duration = int(company_info["scheduling"]["event_duration"])


            calendar = GoogleCalendar(self.email, credentials_path = "credentials.json")
            self.events = [x for x in calendar.get_events(time_min=datetime.now(), time_max=datetime.now() + timedelta(days=30))]
            self.calendar = calendar
            self.start_timings = [x.start for x in self.calendar if x.start is not None]
            self.end_timings = [x.end for x in self.calendar if x.end is not None]
            self.scratchpad = ""

    def __str__(self) -> str:
        return "Agent with ability to schedule meetings"

    @property
    def prompt(self) -> None:
        s = """
        You are a customer service agent for {company_desc} tasked with helping them schedule {event_type} for the human agents to carry out. You will be helping to schedule {appointment_type}. To schedule an appointment, you will need the following information:
        {fields_required_bulleted}
        - Date and Time 

        You run in a loop of Thought, Action, PAUSE, Observation.
        At the end of the loop you output an Answer
        Use Thought to describe your thoughts about the question you have been asked.
        Use Action to run one of the actions available to you - then return PAUSE.
        Observation will be the result of running the single action and are provided by the customer to you.
        Use Answer to output the answer to the question you have been asked.

        Thus, all your outputs are prefixed with Action or Answer

        Your available actions are:

        When you use a action, your action should just be the string and nothing else. You can only use one action per output
        
        ### Get available slots for a specific time period
        Output: Range: [Starting Date and Time in format %Y-%m-%d %H:%M:%S%z] | [Ending Date and Time in format %Y-%m-%d %H:%M:%S%z]
        
        eg.
        Thought: I want to get available slots between 2021-10-01 08:00:00+08:00 and 2021-10-05 18:00:00+08:00
        Action: Range: 2021-10-01 08:00:00+08:00 | 2021-10-05 18:00:00+08:00
        Returns date and times that are available within the starting and ending date

        ### Check if a specific date and time is available
        Output: Check: [Date and Time in format %Y-%m-%d %H:%M:%S%z]. Do not use this if assistant had previously suggested time slots, since assistant would have used Range tool and it is guaranteed that the time slot is available.

        eg.
        Thought: I want to check if 2021-10-01 08:00:00+08:00 is available.
        Action: Check: 2021-10-01 08:00:00+08:00
        Returns a boolean value indicating if the date and time is available.

        ### Confirm event
        Output: Confirm: {required_fields_formatted} | [Date and Time in format %Y-%m-%d %H:%M:%S%z]. Use this method when the user provides a specific date and time and you have all the fields ready

        Eg.
        Thought: I have all the information required. I want to confirm the {event_type}. I need to add the event to the calendar
        Action: Confirm: [INFORMATION] | 2021-10-01 08:00:00+08:00
        Adds appointment to the calendar. Otherwise, appointment is not confirmed

        where [INFORMATION] is a comma separated list of {required_fields_formatted}.

        To speak to the customer, output: Answer: [your message here] 
        
        Example session with chain of thought:
        Question: Is tmr available?
        Thought: I need to get the available slots for tmr
        Action: Range: 2021-10-01 08:00:00+08:00 | 2021-10-01 18:00:00+08:00

        (Your output ends here)
        PAUSE

        The customer provides
        Observation: [list of available slots]

        You then output:

        Answer: I have the following slots available: [list of available slots]

        --

        Example session with no need for actions:
        Question: I want to make an appointment
        Answer: Sure! I can help you with that. May I have {required_fields_formatted}?

        Guidelines for customer interaction:
        - You are not to say you are a bot or cannot schedule the appointment. You must pretend to be a human agent
        - Ask for date and time in a separate message from the other fields
        - You should not let the customer know that you are using these tools.
        - Do not assume the availability of a time slot, always use tools
        - ONLY ask for {required_fields_formatted} and nothing else
        - Do not ask for permission to use a tool. Just use it by calling Action
        - Your tone is professional and polite
        - Ask for confirmation before confirming

        Remember to prefix your output with Action: or Answer: never both. You can only use one action per output

        Current time: {current_date} Day: {current_day}, timezone: GMT+8
        """
        return PromptTemplate(s)

    
    def generate_answer(self, query, chat_history = list(), system_prompt = None) -> dict:
        self.company_desc = self.company_desc
        self.usage = {}

        if not self.to_schedule:
            return {
                "answer": "",
                "usage": {}
                }

        ACTION_MAPPING = {
            "Range": self.get_available_slots,
            "Check": self.check_clash,
            "Confirm": self.confirm_event
        }

        if system_prompt is None:
            to_human = False
            iterations = 0
            next_prompt = query
            while True:
                iterations += 1
                if iterations > 3:
                    raise Exception("Too many iterations")
                system_prompt = self.prompt.format({
                    "company_desc": self.company_desc,
                    "appointment_type": self.appointment_type,
                    "current_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S%z"),
                    "current_day": datetime.now().strftime("%A"),
                    # "scratchpad": self.scratchpad,
                    "fields_required_bulleted": "\n".join([f"- {x}" for x in self.fields_required]),
                    "event_type": self.event_type,
                    "required_fields_formatted": ",".join(self.fields_required)}
                )
                
                ans_payload = super().generate_answer(
                    query = next_prompt,
                    chat_history = chat_history,
                    system_prompt = system_prompt
                )

                result = ans_payload["answer"]
                self.usage = ans_payload["usage"] if self.usage == {} else sum_dict(self.usage, ans_payload["usage"])

                print("Raw Answer: " + result)

                chat_history.append({"role": "user", "content": query})
                chat_history.append({"role": "assistant", "content": result})

                action_re = re.compile('^Action: (\w+): (.*)$')
                actions = [action_re.match(a) for a in result.split('\n') if action_re.match(a)]  
                answers_re = re.compile("^Answer: (.*)$")
                answers = [answers_re.match(a) for a in result.split('\n') if answers_re.match(a)]

                if actions: # There is actions 
                    action, action_input = actions[0].groups()
                    if action not in ACTION_MAPPING:
                        next_prompt = f"Invalid action: {action}. Valid: {', '.join(ACTION_MAPPING.keys())}"
                        print(f"\033[1;31mInvalid action:{action} \033[0m")
                    else:
                        print("\033[93m"+"Carrying out action: " + action + " with input: " + action_input + "\033[0m")
                        observation = ACTION_MAPPING[action](action_input)
                        print("\033[93m"+"Observation " +  observation + "\033[0m")
                        if action == "Confirm":
                            ans = observation
                            break
                        next_prompt = f"Observation: {observation}"
                elif answers: # There is an answer
                    ans_substring = answers[0].groups()[0]
                    index = result.find(ans_substring)
                    ans = result[index:]
                    break
                else:
                    ans = result # assume answer
                    break

                # except Exception as e:
                #     print(e)
                    # self.scratchpad += "\nInvalid Input: make sure you follow the format of the tool"
                
                # print("\033[1;31m"+self.scratchpad + "\033[0m")
                print("---")


            ans_payload["answer"] = ans
            ans_payload["usage"] = self.usage
            return ans_payload

    def confirm_event(self, query) -> bool:
        '''Confirm and add to calendar'''
        query = query.replace("Confirm: ", "").strip()
        fields = query.split(" | ")
        description = fields[0]
        start = parser.parse(fields[1])
        clash = self.check_clash(start)

        if clash == "This slot is available":
            event = Event(
                summary = description,
                start = start,
                end = start + timedelta(minutes=self.event_duration))
            self.calendar.add_event(event)
            return f"Confirmed. The appointment is confirmed for {self.format_datetime(start)}"
        else:
            return f"This slot clashes with another event"
    
    def check_clash(self, tocheck) -> str:
        timings = [(x.start, x.end) for x in self.events if x.start != None]
        if isinstance(tocheck, str):
            if "Check: " in tocheck:
                tocheck = parser.parse(tocheck.replace("Check: ", "").strip())
            else:
                tocheck = parser.parse(tocheck)
        elif isinstance(tocheck, datetime):
            pass
        for other_start, other_end in timings:
            if (other_start.date() == tocheck.date() or other_end.date() == tocheck.date()) and \
            ((tocheck + timedelta(minutes=self.event_duration) + timedelta(minutes=self.clash_condition) > other_start) and (tocheck < other_end)) or \
            ((tocheck - timedelta(minutes=self.clash_condition)) < other_end and (tocheck + timedelta(minutes=self.event_duration) > other_start)):
                return "This slot clashes"


        return "This slot is available"


    
    def get_available_slots(self, query) -> str:
        '''Get available slots between two times'''
        query = query.replace("Range: ", "").strip()
        fields = query.split(" | ")
        starttime = parser.parse(fields[0])
        endtime = parser.parse(fields[1])
        result = []
        current = starttime
        while current < endtime: # get all slots
            if (self.start_time.time() <= current.time() <= self.end_time.time()) and (self.check_clash(current) == "This slot is available"):
                result.append(current)
            current += timedelta(minutes=self.interval)
        if len(result) == 0:
            return "No available slots"
        return '\n'.join([self.format_datetime(x) for x in result][:10])
            
    def provide_alternatives(self, start, n) -> str:
        result = []
        left = start
        right = start
        counter = 0
        while counter <= n * 2:
            if left.time() >= self.start_time.time():
                left -= timedelta(minutes=self.interval) 
                result.append(left)
            if right.time() <= self.end_time.time():
                right += timedelta(minutes=self.interval)
                result.append(right)
            counter += 2
        
        if len(result) == 0:
            return ""
        
        result = sorted(result, key = lambda x: abs(x - start))
        return '\n'.join([self.format_datetime(x) for x in result if not self.check_clash(x)][:n])
    
    # def update_event(self, query) -> bool:
    #     query = query.replace("Update: ", "").strip()
    #     fields = query.split(" | ")
    #     description = fields[0]
    #     start = parser.parse(fields[1])
    #     clash = self.check_clash(start)

    #     if not clash:
    #         event = Event(
    #             summary = description,
    #             start = start,
    #             end = start + timedelta(minutes=self.event_duration))
    #         self.calendar.add_event(event)
    #         self.event_string = f"Confirmed. Your appointment is updated successfully."
    #         return True
    #     else:
    #         self.curr = start # For alternative timings
    #         return False
    
    # def get_event_details(self, query):
    #     query = query.replace("Details: ", "").strip()
    #     start = parser.parse(query)
    #     return str(self.calendar.get_events(start,start))
    
    def format_datetime(self, datetime_obj):
        return datetime_obj.strftime('%B %d, %Y at %I:%M %p')




       