import sys
import os
import urllib.request
import json
import xml.etree.ElementTree as ET
from datetime import datetime

ci_metrics_fp = "build/reports/ci-metrics.json"

if os.path.isfile(ci_metrics_fp):
    print("INFO ci-metrics.json file already exists, using the data present in that file")
    sys.exit(0)


def count_metrics(tree):
    errors = "unknown"
    failures = "unknown"
    total = "unknown"
    testsuites = 0
    root = tree.getroot()
    for testsuite in root:
        if testsuites == 0:
            errors = 0
            failures = 0
            total = 0
        errors = errors + int(testsuite.get("errors"))
        num_failures = testsuite.get("failures")
        # for linting - failure is not an option
        if num_failures is not None:
            failures = failures + int(testsuite.get("failures"))
        total = total + int(testsuite.get("tests"))
        testsuites = testsuites + 1
    return errors, failures, total


def list_nodes(tree):
    root = tree.getroot()
    for child in root:
        print(child.get("errors"), child.get("failures"), child.get("tests"))


# read environment variables
env_commit_sha = os.environ['CI_COMMIT_SHA']
env_project_id = os.environ['CI_PROJECT_ID']

# read pipeline status
project_url = "https://gitlab.com/api/v4/projects/" + env_project_id
project_pipelines_url = project_url + "/pipelines"

# setup defaults in case of problems getting the data
project_pipelines = None
latest_build_timestamp = "unknown"
try:
    # Load data about last builds (pipelines) using GitLab API
    pipeline_data = urllib.request.urlopen(project_pipelines_url).read()
    project_pipelines = json.loads(pipeline_data)
except Exception as e:
    print("WARNING failed accessing pipeline data:", e)

try:
    for pipeline in project_pipelines:
        if pipeline["ref"] == "master":
            latest_pipeline_id = str(pipeline["id"])
            latest_build_date = pipeline["created_at"]
            latest_build_timestamp = datetime.timestamp(datetime.strptime(latest_build_date, '%Y-%m-%dT%H:%M:%S.%fZ'))
            break
except Exception as e:
    print("WARNING failed to parse pipeline data:", e)

env_commit_sha = "dummy"
latest_build_timestamp = "some timestamp"

# parse coverage report
cov_tree = None
cov_rate = "unknown"
try:
    cov_tree = ET.parse('build/reports/code-coverage.xml')
except FileNotFoundError:
    print("WARNING code-coverage.xml file not found")

if cov_tree:
    try:
        cov_root = cov_tree.getroot()
        cov_rate = 100 * float(cov_root.get("line-rate"))
    except AttributeError as e:
        print(
            "WARNING: Attribute not found. Make sure that the file code-coverage.xml has the correct 'line-rate' attribute: ",
            e)

# parse unit tests
tests_errors = "unknown"
tests_failures = "unknown"
tests_total = "unknown"
try:
    tree = ET.parse('build/reports/unit-tests.xml')
    tests_errors, tests_failures, tests_total = count_metrics(tree)
except Exception as e:
    print("WARNING exception caught: ", e)

if tests_errors == "unknown" or tests_failures == "unknown" or tests_total == "unknown":
    print("WARNING: Attribute not found. Make sure that the file unit-tests.xml is in the correct format")

# parse linting report
lint_errors = "unknown"
lint_failures = "unknown"
lint_total = "unknown"
try:
    tree = ET.parse('build/reports/linting.xml')
    list_nodes(tree)
    lint_errors, lint_failures, lint_total = count_metrics(tree)
except Exception as e:
    print("WARNING exception caught: ", e)

if lint_errors == "unknown" or lint_failures == "unknown" or lint_total == "unknown":
    print("WARNING: Attribute not found. Make sure that the file linting.xml is in the correct format")

# create data object with all the collected info
ci_metrics_data = {
    "commit-sha": env_commit_sha,
    "build-status": {
        "last": {
            "timestamp": latest_build_timestamp
        },
    },
    "coverage": {
        "percentage": cov_rate
    },
    "tests": {
        "errors": tests_errors,
        "failures": tests_failures,
        "total": tests_total
    },
    "lint": {
        "errors": lint_errors,
        "failures": lint_failures,
        "total": lint_total
    }
}

with open(ci_metrics_fp, "w") as write_file:
    json.dump(ci_metrics_data, write_file)
