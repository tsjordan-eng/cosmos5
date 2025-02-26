# Copyright 2023 OpenC3, Inc.
# All Rights Reserved.
#
# This program is free software; you can modify and/or redistribute it
# under the terms of the GNU Affero General Public License
# as published by the Free Software Foundation; version 3 with
# attribution addendums as found in the LICENSE.txt
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.

# This file may also be used under the terms of a commercial license
# if purchased from OpenC3, Inc.

import os

os.environ["OPENC3_NO_STORE"] = "true"
os.environ["OPENC3_CLOUD"] = "local"
os.environ["OPENC3_LOGS_BUCKET"] = "logs"
os.environ["OPENC3_TOOLS_BUCKET"] = "tools"
os.environ["OPENC3_CONFIG_BUCKET"] = "config"
os.environ["OPENC3_LOCAL_MODE_PATH"] = os.path.dirname(__file__)
import io
import sys
import json
import fakeredis
from unittest.mock import *
from openc3.models.cvt_model import CvtModel
from openc3.utilities.logger import Logger
from openc3.utilities.store import Store, EphemeralStore
from openc3.system.system import System

TEST_DIR = os.path.dirname(__file__)
Logger.no_store = True


def setup_system(targets=["SYSTEM", "INST", "EMPTY"]):
    Logger.stdout = False
    file_path = os.path.realpath(__file__)
    dir = os.path.abspath(os.path.join(file_path, "..", "install", "config", "targets"))
    System.instance_obj = None
    System(targets, dir)

    # Initialize the packets in Redis
    for target_name in targets:
        try:
            for packet_name, packet in System.telemetry.packets(target_name).items():
                Store.hset(
                    f"DEFAULT__openc3tlm__{target_name}",
                    packet_name,
                    json.dumps(packet.as_json()),
                )
                packet = System.telemetry.packet(target_name, packet_name)
                # packet.received_time = datetime.now(timezone.utc)
                json_hash = {}
                for item in packet.sorted_items:
                    # Initialize all items to None like TargetModel::update_store does in Ruby
                    json_hash[item.name] = None
                CvtModel.set(
                    json_hash,  # CvtModel.build_json_from_packet(packet),
                    packet.target_name,
                    packet.packet_name,
                    scope="DEFAULT",
                )
        except RuntimeError:
            pass
        try:
            for packet_name, packet in System.commands.packets(target_name).items():
                Store.hset(
                    f"DEFAULT__openc3cmd__{target_name}",
                    packet_name,
                    json.dumps(packet.as_json()),
                )
        except RuntimeError:
            pass

        try:
            sets = {}
            for set in System.limits.sets():
                sets[set] = "false"
            Store.hset("DEFAULT__limits_sets", mapping=sets)
        except RuntimeError:
            pass


def mock_redis(self):
    # Ensure the store builds a new instance of redis and doesn't
    # reuse the existing instance which results in a reused FakeRedis
    EphemeralStore.my_instance = None
    Store.my_instance = None
    redis = fakeredis.FakeRedis()
    patcher = patch("redis.Redis", return_value=redis)
    patcher.start()
    self.addCleanup(patcher.stop)
    return redis


class MockS3:
    def __init__(self):
        self.clear()

    def client(self, *args, **kwags):
        return self

    def put_object(self, *args, **kwargs):
        self.files[kwargs["Key"]] = kwargs["Body"].read()

    def clear(self):
        self.files = {}


# Create a MockS3 to make this a singleton
mocks3 = MockS3()


def mock_s3(self):
    # Clear it out everytime it is used
    mocks3.clear()
    patcher = patch("boto3.session.Session", return_value=mocks3)
    patcher.start()
    self.addCleanup(patcher.stop)
    return mocks3


def capture_io():
    stdout = sys.stdout
    capturedOutput = io.StringIO()  # Create StringIO object
    sys.stdout = capturedOutput  #  and redirect stdout.
    Logger.stdout = True
    Logger.level = Logger.INFO
    yield capturedOutput
    Logger.level = Logger.FATAL
    sys.stdout = stdout
