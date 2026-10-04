// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract Election {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public voters;

    uint256 public candidatesCount;
    address public owner;

    enum ElectionState {
        NOT_STARTED,
        ACTIVE,
        CLOSED
    }

    ElectionState public electionState;

    event CandidateAdded(uint256 indexed candidateId, string name);
    event ElectionStarted();
    event ElectionEnded();
    event VoteCast(address indexed voter, uint256 indexed candidateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() public {
        owner = msg.sender;
        electionState = ElectionState.NOT_STARTED;

        addCandidate("John Wick");
        addCandidate("Browney Jr");
        addCandidate("Helena Williams");
    }

    function addCandidate(string memory _name) public onlyOwner {
        require(bytes(_name).length > 0, "Candidate name cannot be empty");
        require(electionState == ElectionState.NOT_STARTED, "Election has already started");
        
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);

        emit CandidateAdded(candidatesCount, _name);
    }

    function startElection() public onlyOwner {
        require(electionState == ElectionState.NOT_STARTED, "Election already started or closed");
        electionState = ElectionState.ACTIVE;
        emit ElectionStarted();
    }

    function endElection() public onlyOwner {
        require(electionState == ElectionState.ACTIVE, "Election is not active");
        electionState = ElectionState.CLOSED;
        emit ElectionEnded();
    }

    function vote(uint256 _candidateId) public {
        require(electionState == ElectionState.ACTIVE, "Election is not active");
        require(!voters[msg.sender], "Voter has already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId);
    }
}
