import requests
from datetime import timedelta
from airflow import DAG
from airflow.operators.bash_operator import BashOperator
from airflow.utils.dates import days_ago

default_args = {"owner": "airflow", "start_date": days_ago(2)}

dag = DAG("minimal_sast_test", default_args=default_args, schedule_interval=timedelta(days=1))

user_input = requests.get("https://fakeurl.asdf/input").text

# ruleid: formatted-string-bashoperator
t1 = BashOperator(task_id="risk_1", bash_command="echo " + user_input, dag=dag)

# ruleid: formatted-string-bashoperator
t2 = BashOperator(task_id="risk_2", bash_command="ls {}".format(user_input), dag=dag)

# ruleid: formatted-string-bashoperator
t3 = BashOperator(task_id="risk_3", bash_command=f"ping {user_input}", dag=dag)

hostname = requests.get("https://fakeurl.asdf/hostname").text

# ruleid: formatted-string-bashoperator
t4 = BashOperator(task_id="risk_4", bash_command="curl %s" % hostname, dag=dag)

t1 >> t2 >> t3 >> t4
