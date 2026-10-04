var Election = artifacts.require("./Election.sol");

contract("Election", function (accounts) {
    var electionInstance;
    var owner = accounts[0];
    var nonOwner = accounts[1];
    var voter1 = accounts[2];
    var voter2 = accounts[3];

    it("1. Contract deploys.", function () {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;
            assert(electionInstance.address !== '');
        });
    });

    it("2. Deployer becomes owner.", function () {
        return electionInstance.owner().then(function (contractOwner) {
            assert.equal(contractOwner, owner, "deployer is owner");
        });
    });

    it("3. Initial candidates exist.", function () {
        return electionInstance.candidatesCount().then(function (count) {
            assert.equal(count, 3, "should be 3 initial candidates");
        });
    });

    it("4. Non-owner cannot add candidate.", function () {
        return electionInstance.addCandidate("Fake", { from: nonOwner })
            .then(assert.fail).catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            });
    });

    it("5. Owner can add candidate before election starts. 17. CandidateAdded event emitted.", function () {
        return electionInstance.addCandidate("New Candidate", { from: owner }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            assert.equal(receipt.logs[0].event, "CandidateAdded", "event type is correct");
            assert.equal(receipt.logs[0].args.name, "New Candidate", "candidate name is correct");
            return electionInstance.candidatesCount();
        }).then(function(count) {
            assert.equal(count, 4, "candidates count incremented");
        });
    });

    it("7. Election initially NOT_STARTED.", function () {
        return electionInstance.electionState().then(function (state) {
            assert.equal(state.toNumber(), 0, "state is NOT_STARTED (0)");
        });
    });

    it("10. Voting before start is rejected.", function () {
        return electionInstance.vote(1, { from: voter1 })
            .then(assert.fail).catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            });
    });

    it("9. Non-owner cannot start election.", function () {
        return electionInstance.startElection({ from: nonOwner })
            .then(assert.fail).catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            });
    });

    it("8. Owner can start election. 18. ElectionStarted event emitted.", function () {
        return electionInstance.startElection({ from: owner }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            assert.equal(receipt.logs[0].event, "ElectionStarted", "event type is correct");
            return electionInstance.electionState();
        }).then(function(state) {
            assert.equal(state.toNumber(), 1, "state is ACTIVE (1)");
        });
    });

    it("6. Candidate cannot be added after election starts.", function () {
        return electionInstance.addCandidate("Late Candidate", { from: owner })
            .then(assert.fail).catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            });
    });

    it("11. Voting while ACTIVE works. 19. VoteCast event emitted.", function () {
        return electionInstance.vote(1, { from: voter1 }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            assert.equal(receipt.logs[0].event, "VoteCast", "event type is correct");
            assert.equal(receipt.logs[0].args.candidateId.toNumber(), 1, "candidate id is correct");
            return electionInstance.candidates(1);
        }).then(function(candidate) {
            assert.equal(candidate[2].toNumber(), 1, "vote count incremented");
        });
    });

    it("12. Same wallet cannot vote twice.", function () {
        return electionInstance.vote(1, { from: voter1 })
            .then(assert.fail).catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            });
    });

    it("13. Invalid candidate ID is rejected.", function () {
        return electionInstance.vote(99, { from: voter2 })
            .then(assert.fail).catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            });
    });

    it("14. Non-owner cannot end election.", function () {
        return electionInstance.endElection({ from: nonOwner })
            .then(assert.fail).catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            });
    });

    it("15. Owner can end election. 20. ElectionEnded event emitted.", function () {
        return electionInstance.endElection({ from: owner }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            assert.equal(receipt.logs[0].event, "ElectionEnded", "event type is correct");
            return electionInstance.electionState();
        }).then(function(state) {
            assert.equal(state.toNumber(), 2, "state is CLOSED (2)");
        });
    });

    it("16. Voting after CLOSED is rejected.", function () {
        return electionInstance.vote(2, { from: voter2 })
            .then(assert.fail).catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            });
    });
});
