App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    hasVoted: false,
    candidatesCount: 0,
    candidates: [],
    totalVotes: 0,
    networkName: 'Unknown',
    contractAddress: '-',
    selectedCandidateId: null,
    isDemoMode: false,
    demoElectionStatus: 'ACTIVE',

    init: function () {
        // App starts at the landing screen
        // Live or Demo mode is triggered by the UI buttons
    },

    startLiveMode: function() {
        $("#landingScreen").hide();
        $("#mainAppWrapper").show();
        $("#liveBanner").css("display", "flex");
        App.isDemoMode = false;
        return App.initWeb3();
    },

    startDemoMode: function() {
        $("#landingScreen").hide();
        $("#mainAppWrapper").show();
        $("#demoBanner").css("display", "flex");
        App.isDemoMode = true;
        
        // Hide blockchain-specific UI in Demo mode
        $("#connectWalletBtn").hide();
        $(".blockchain-info-section").hide();
        
        // Setup Demo Identity
        App.account = "DEMO-VOTER-" + Math.floor(Math.random() * 10000);
        App.networkName = "Local Demo Simulation";
        $("#sidebarNetwork").text(App.networkName);
        
        App.initDemoState();
        App.renderDemo();
    },

    exitToLanding: function() {
        window.location.reload();
    },

    switchAdmin: function() {
        $("#voterLayout").hide();
        $("#adminLayout").show();
        $("#btnSwitchAdmin").hide();
        $("#btnSwitchVoter").show();
        App.renderAdmin();
    },

    switchVoter: function() {
        $("#adminLayout").hide();
        $("#voterLayout").show();
        $("#btnSwitchVoter").hide();
        $("#btnSwitchAdmin").show();
        App.renderDemo();
    },

    initDemoState: function() {
        if (!localStorage.getItem("demoCandidates")) {
            App.demoReset(true);
        } else {
            App.candidates = JSON.parse(localStorage.getItem("demoCandidates"));
            App.demoElectionStatus = localStorage.getItem("demoElectionStatus") || 'ACTIVE';
            var voted = JSON.parse(localStorage.getItem("demoVoted") || "{}");
            App.hasVoted = !!voted[App.account];
        }
    },

    saveDemoState: function() {
        localStorage.setItem("demoCandidates", JSON.stringify(App.candidates));
        localStorage.setItem("demoElectionStatus", App.demoElectionStatus);
    },

    demoReset: function(silent) {
        App.candidates = [
            { id: 1, name: "Rahul Sharma", voteCount: 0 },
            { id: 2, name: "Priya Mehta", voteCount: 0 },
            { id: 3, name: "Arjun Patel", voteCount: 0 }
        ];
        App.demoElectionStatus = 'ACTIVE';
        localStorage.setItem("demoVoted", "{}");
        App.hasVoted = false;
        App.saveDemoState();
        if (!silent) {
            if ($("#adminLayout").is(":visible")) App.renderAdmin();
            else App.renderDemo();
            App.showToast("Demo reset to initial state.", "info");
        }
    },

    demoStartElection: function() {
        App.demoElectionStatus = 'ACTIVE';
        App.saveDemoState();
        App.renderAdmin();
        App.showToast("Election Started.", "success");
    },

    demoEndElection: function() {
        App.demoElectionStatus = 'CLOSED';
        App.saveDemoState();
        App.renderAdmin();
        App.showToast("Election Closed.", "warning");
    },

    demoAddCandidate: function() {
        var name = $("#newCandidateName").val().trim();
        if (!name) return;
        var newId = App.candidates.length > 0 ? Math.max(...App.candidates.map(c => c.id)) + 1 : 1;
        App.candidates.push({ id: newId, name: name, voteCount: 0 });
        $("#newCandidateName").val("");
        App.saveDemoState();
        App.renderAdmin();
        App.showToast("Candidate added.", "success");
    },

    demoRemoveCandidate: function(id) {
        App.candidates = App.candidates.filter(c => c.id !== id);
        App.saveDemoState();
        App.renderAdmin();
    },

    renderAdmin: function() {
        $("#adminElectionStatus").text(App.demoElectionStatus);
        var tbody = $("#adminCandidatesList");
        tbody.empty();
        
        App.candidates.forEach(function(c) {
            var tr = $('<tr></tr>');
            tr.append('<td>' + c.id + '</td>');
            tr.append('<td>' + c.name + '</td>');
            tr.append('<td>' + c.voteCount + '</td>');
            var tdAction = $('<td></td>');
            var btn = $('<button class="btn-sm-danger">Remove</button>');
            btn.click(function() { App.demoRemoveCandidate(c.id); });
            tdAction.append(btn);
            tr.append(tdAction);
            tbody.append(tr);
        });
    },

    renderDemo: function() {
        App.candidatesCount = App.candidates.length;
        App.totalVotes = App.candidates.reduce(function(acc, c) { return acc + c.voteCount; }, 0);
        
        $("#statCandidates").text(App.candidatesCount);
        $("#statTotalVotes").text(App.totalVotes);
        $("#sidebarCandidates").text(App.candidatesCount);
        $("#sidebarTotalVotes").text(App.totalVotes);
        
        if (App.demoElectionStatus === 'CLOSED') {
            $(".status-active").text("CLOSED").css("color", "var(--error)");
            $(".badge-success").html('<i data-lucide="x-circle" style="width: 12px; height: 12px; margin-right: 4px;"></i> CLOSED').css("background", "var(--error-bg)").css("color", "var(--error)");
        } else {
            $(".status-active").text("ACTIVE").css("color", "var(--success)");
            $(".badge-success").html('<i data-lucide="check-circle-2" style="width: 12px; height: 12px; margin-right: 4px;"></i> ACTIVE').css("background", "var(--success-bg)").css("color", "var(--success)");
        }
        
        App.renderCandidates();
        App.renderResults();
        
        $("#loader").hide();
        $("#candidatesList").show();
        lucide.createIcons();
    },

    initWeb3: function () {
        if (typeof window.ethereum !== 'undefined') {
            App.web3Provider = window.ethereum;
            web3 = new Web3(window.ethereum);
            try {
                window.ethereum.request({ method: 'eth_requestAccounts' }).then(function() {
                    App.onWalletConnected();
                });
            } catch (error) {
                console.error("User denied account access");
                App.showToast("Error connecting wallet", "error");
            }
        } else if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
            App.onWalletConnected();
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
            App.onWalletConnected();
        }
        
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', function (accounts) {
                window.location.reload();
            });
            window.ethereum.on('chainChanged', function (chainId) {
                window.location.reload();
            });
        }
    },

    onWalletConnected: function() {
        App.initContract();
    },

    initContract: function () {
        $.getJSON("build/contracts/Election.json", function (election) {
            App.contracts.Election = TruffleContract(election);
            App.contracts.Election.setProvider(App.web3Provider);
            
            App.contracts.Election.deployed().then(function(instance) {
                App.contractAddress = instance.address;
                $('#infoContract').text(instance.address);
                App.listenForEvents(instance);
                return App.render();
            }).catch(function(err) {
                console.error("Contract not deployed to detected network.", err);
                App.showToast("Contract not deployed on this network.", "error");
            });
        });
    },

    listenForEvents: function (instance) {
        // Listening for events emitted from the contract
        instance.votedEvent({}, {
            fromBlock: 0,
            toBlock: 'latest'
        }).watch(function (error, event) {
            if (!error) {
                console.log("event triggered", event);
                // We reload UI silently when event happens
                App.renderData();
            }
        });
    },

    getNetworkName: function(id) {
        switch (id) {
            case "1": return "Ethereum Mainnet";
            case "2": return "Morden";
            case "3": return "Ropsten";
            case "4": return "Rinkeby";
            case "5": return "Goerli";
            case "42": return "Kovan";
            case "11155111": return "Sepolia";
            case "5777": return "Ganache / Local";
            default: return "Network ID: " + id;
        }
    },

    render: function () {
        var loader = $("#loader");
        var content = $("#candidatesList");

        loader.show();
        content.hide();

        web3.eth.getCoinbase(function (err, account) {
            if (err === null && account) {
                App.account = account;
                var shortAccount = account.substring(0,6) + '...' + account.substring(account.length-4);
                
                $("#infoWallet").text(account);
                
                var btn = $("#connectWalletBtn");
                btn.html('<span class="indicator active"></span> ' + shortAccount);
                btn.addClass('connected');
                
                $("#infoStatusIndicator").addClass('active');
                $("#infoStatusText").text("Connected");
            } else {
                $("#infoStatusIndicator").removeClass('active').addClass('error');
                $("#infoStatusText").text("Disconnected");
            }
        });

        web3.version.getNetwork(function(err, netId) {
            if (!err) {
                App.networkName = App.getNetworkName(netId);
                
                if (netId !== "11155111" && netId !== "5777" && netId !== "1337") {
                    $("#networkName").html("&#9888; Wrong Network");
                    $("#networkBadge .indicator").removeClass('active').addClass('warning');
                    App.showToast("Please switch to Sepolia testnet.", "warning");
                } else {
                    $("#networkName").text(App.networkName);
                    $("#networkBadge .indicator").removeClass('warning').addClass('active');
                }
                
                $("#infoNetwork").text(App.networkName);
                $("#sidebarNetwork").text(App.networkName);
            }
        });
        
        web3.eth.getBlockNumber(function(err, blockNum) {
            if (!err) {
                $("#infoBlock").text(blockNum);
            }
        });

        App.renderData();
    },
    
    renderData: function() {
        var electionInstance;
        
        App.contracts.Election.deployed().then(function (instance) {
            electionInstance = instance;
            return electionInstance.candidatesCount();
        }).then(function (count) {
            App.candidatesCount = count.toNumber();
            var promises = [];
            for (var i = 1; i <= App.candidatesCount; i++) {
                promises.push(electionInstance.candidates(i));
            }
            return Promise.all(promises);
        }).then(function (candidatesData) {
            App.candidates = candidatesData.map(function(c) {
                return {
                    id: c[0].toNumber(),
                    name: c[1],
                    voteCount: c[2].toNumber()
                };
            });
            
            App.totalVotes = App.candidates.reduce(function(acc, c) { return acc + c.voteCount; }, 0);
            
            // Update Stats
            $("#statCandidates").text(App.candidatesCount);
            $("#statTotalVotes").text(App.totalVotes);
            $("#sidebarCandidates").text(App.candidatesCount);
            $("#sidebarTotalVotes").text(App.totalVotes);
            
            return electionInstance.voters(App.account);
        }).then(function (hasVoted) {
            App.hasVoted = hasVoted;
            
            App.renderCandidates();
            App.renderResults();
            
            $("#loader").hide();
            $("#candidatesList").show();
        }).catch(function (error) {
            console.warn(error);
        });
    },
    
    renderCandidates: function() {
        var container = $("#candidatesList");
        container.empty();
        
        App.candidates.forEach(function(c) {
            var percentage = App.totalVotes > 0 ? ((c.voteCount / App.totalVotes) * 100).toFixed(1) : 0;
            var numStr = (c.id < 10) ? '0' + c.id : c.id;
            
            // Generate initials
            var initials = c.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().substring(0, 2);
            
            var row = $('<div class="candidate-row"></div>');
            
            var left = $('<div class="candidate-left"></div>');
            left.append('<span class="candidate-number">' + numStr + '</span>');
            left.append('<div class="candidate-avatar">' + initials + '</div>');
            
            var info = $('<div class="candidate-info"></div>');
            info.append('<span class="candidate-name">' + c.name + '</span>');
            info.append('<span class="candidate-label">Candidate</span>');
            left.append(info);
            
            var center = $('<div class="candidate-center"></div>');
            var statsHeader = $('<div class="candidate-stats-header"></div>');
            statsHeader.append('<span class="candidate-votes">' + c.voteCount + ' votes</span>');
            statsHeader.append('<span class="candidate-percentage">' + percentage + '%</span>');
            center.append(statsHeader);
            
            var progress = $('<div class="progress-container"><div class="progress-bar" style="width: ' + percentage + '%"></div></div>');
            center.append(progress);
            
            var right = $('<div class="candidate-right"></div>');
            var btn = $('<button class="btn-primary">Cast Vote</button>');
            
            if (App.isDemoMode && App.demoElectionStatus !== 'ACTIVE') {
                btn.prop('disabled', true);
                btn.text('Closed');
            } else if (App.hasVoted) {
                btn.prop('disabled', true);
                btn.text('Voted');
            } else {
                btn.click(function() {
                    App.openConfirmModal(c.id, c.name);
                });
            }
            
            right.append(btn);
            
            row.append(left);
            row.append(center);
            row.append(right);
            
            container.append(row);
        });
    },
    
    renderResults: function() {
        var container = $("#resultsList");
        container.empty();
        
        // Sort candidates by vote count descending
        var sorted = [...App.candidates].sort((a,b) => b.voteCount - a.voteCount);
        
        sorted.forEach(function(c, index) {
            var percentage = App.totalVotes > 0 ? ((c.voteCount / App.totalVotes) * 100).toFixed(1) : 0;
            var numStr = (index + 1 < 10) ? '0' + (index + 1) : (index + 1);
            
            var item = $('<div class="result-item"></div>');
            var header = $('<div class="result-header"></div>');
            header.append('<div class="result-name"><span class="candidate-number">' + numStr + '</span> ' + c.name + '</div>');
            header.append('<div class="result-stats">' + c.voteCount + ' votes <span class="candidate-percentage">(' + percentage + '%)</span></div>');
            
            var bar = $('<div class="result-bar-bg"><div class="result-bar-fill" style="width: ' + percentage + '%"></div></div>');
            
            item.append(header);
            item.append(bar);
            container.append(item);
        });
    },
    
    openConfirmModal: function(id, name) {
        App.selectedCandidateId = id;
        $("#modalCandidateName").text(name);
        
        var shortAccount = App.account ? App.account.substring(0,6) + '...' + App.account.substring(App.account.length-4) : '-';
        $("#modalWallet").text(shortAccount);
        $("#modalNetwork").text(App.networkName);
        
        $("#confirmModal").css("display", "flex");
        
        $("#confirmVoteBtn").off('click').on('click', function() {
            App.castVote();
        });
    },
    
    closeModal: function() {
        $("#confirmModal").hide();
        App.selectedCandidateId = null;
    },

    castVote: function () {
        var candidateId = App.selectedCandidateId;
        App.closeModal();
        
        if (App.isDemoMode) {
            if (App.demoElectionStatus !== 'ACTIVE') {
                App.showToast("Election is not active.", "error");
                return;
            }
            if (App.hasVoted) {
                App.showToast("This demo voter has already participated.", "error");
                return;
            }
            
            App.showToast("Simulating vote...", "info");
            setTimeout(function() {
                var candidate = App.candidates.find(c => c.id === candidateId);
                if (candidate) candidate.voteCount++;
                
                var voted = JSON.parse(localStorage.getItem("demoVoted") || "{}");
                voted[App.account] = true;
                localStorage.setItem("demoVoted", JSON.stringify(voted));
                
                App.hasVoted = true;
                App.saveDemoState();
                
                App.showToast("Demo Vote Recorded Successfully!", "success");
                App.renderDemo();
            }, 800);
            return;
        }

        if (App.hasVoted) {
            App.showToast("This wallet has already participated in this election.", "error");
            return;
        }
        
        App.showToast("Waiting for wallet confirmation...", "info");
        
        App.contracts.Election.deployed().then(function (instance) {
            return instance.vote(candidateId, { from: App.account });
        }).then(function (result) {
            var txHash = result.tx;
            App.showToast("Vote Recorded Successfully!<br><span class='toast-tx'>Tx: " + txHash + "</span>", "success");
            
            var shortTx = txHash.substring(0,6) + '...' + txHash.substring(txHash.length-4);
            $("#infoTx").text(shortTx);
            
            $("#candidatesList").hide();
            $("#loader").show();
            App.renderData();
        }).catch(function (err) {
            console.error(err);
            if (err.message.indexOf("revert") >= 0) {
                App.showToast("Vote already recorded. Transaction reverted.", "error");
            } else if (err.message.indexOf("User denied") >= 0) {
                App.showToast("Transaction cancelled by user.", "warning");
            } else {
                App.showToast("Error recording vote. See console.", "error");
            }
        });
    },
    
    showToast: function(message, type) {
        var container = $("#toastContainer");
        var icon = "info";
        if (type === 'success') icon = "check-circle";
        if (type === 'error') icon = "alert-circle";
        if (type === 'warning') icon = "alert-triangle";
        
        var toast = $('<div class="toast ' + type + '"><i data-lucide="' + icon + '"></i> <div>' + message + '</div></div>');
        container.append(toast);
        lucide.createIcons();
        
        setTimeout(function() {
            toast.fadeOut(300, function() { $(this).remove(); });
        }, 5000);
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
