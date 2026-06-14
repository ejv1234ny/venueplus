"""Tests for the Telegram COO bridge command parsing."""
from routers.telegram import parse_command


def test_plain_text_is_a_goal():
    assert parse_command("grow supply in Austin") == ("goal", "grow supply in Austin")


def test_slash_goal():
    assert parse_command("/goal grow supply in Austin") == ("goal", "grow supply in Austin")


def test_botname_suffix_stripped():
    assert parse_command("/goal@VenuePlusCOObot do it") == ("goal", "do it")


def test_simple_commands():
    assert parse_command("/status") == ("status", "")
    assert parse_command("/approve 12") == ("approve", "12")
    assert parse_command("/kill on") == ("kill", "on")
    assert parse_command("/run 5") == ("run", "5")


def test_empty():
    assert parse_command("   ") == ("", "")


def test_goal_pipe_city_split():
    _, arg = parse_command("/goal grow supply | Austin TX")
    goal, _, city = arg.partition("|")
    assert goal.strip() == "grow supply"
    assert city.strip() == "Austin TX"
