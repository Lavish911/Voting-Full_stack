App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    owner: '0x0',
    hasVoted: false,
    candidatesCount: 0,
    candidates: [],
    totalVotes: 0,
    networkName: 'Unknown',
    contractAddress: '-',
    selectedCandidateId: null,
    isDemoMode: false,
    demoElectionStatus: 'ACTIVE',
    liveElectionStatusStr: 'NOT STARTED',
    liveElectionStatusCode: 0,
    contractInstance: null,

    init: function () {
    },

    startLiveMode: function() {
        $("#landingScreen").hide();
        $("#mainAppWrapper").show();
        $("#liveBanner").css("display", "flex");
        App.isDemoMode = false;
        
        // Show blockchain UI
        $("#connectWalletBtn").show();
        $(".blockchain-info-section").show();
        $("#adminLayout").hide();
        $("#voterLayout").show();
        
        return App.initWeb3();
    },

    startDemoMode: function() {
        $("#landingScreen").hide();
        $("#mainAppWrapper").show();
        $("#demoBanner").css("display", "flex");
        App.isDemoMode = true;
        
        $("#connectWalletBtn").hide();
        $(".blockchain-info-section").hide();
        
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
        if (!App.isDemoMode) return;
        $("#voterLayout").hide();
        $("#adminLayout").show();
        $("#btnSwitchAdmin").hide();
        $("#btnSwitchVoter").show();
        App.renderAdmin();
    },

    switchVoter: function() {
        if (!App.isDemoMode) return;
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
        
        $("#headerWallet").text(App.account);
        $("#headerRole").text($("#adminLayout").is(":visible") ? "ADMIN (Demo)" : "VOTER (Demo)");
        $("#headerNetwork").text("Local Demo Simulation");
        $("#liveAdminControls").hide();
        
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
        } else {
            App.showToast("MetaMask is required for Live Blockchain mode.", "error");
            return;
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
        web3.version.getNetwork(function(err, netId) {
            if (err) {
                console.error("Error getting network ID", err);
                return App.render();
            }
            
            if (netId !== "11155111") {
                App.showToast("Wrong Network. Please switch MetaMask to Ethereum Sepolia.", "error");
                return App.render();
            }

            $.getJSON("build/contracts/Election.json", function (election) {
                App.contracts.Election = TruffleContract(election);
                App.contracts.Election.setProvider(App.web3Provider);
                
                App.contracts.Election.deployed().then(function(instance) {
                    App.contractInstance = instance;
                    App.setupContractInstance(instance);
                }).catch(function(err) {
                    console.error("Contract instantiation failed.", err);
                    App.showToast("Contract not deployed on this network.", "error");
                    return App.render();
                });
            });
        });
    },

    setupContractInstance: function(instance) {
        App.contractAddress = instance.address;
        $('#infoContract').text(instance.address);
        App.listenForEvents(instance);
        return App.render();
    },

    listenForEvents: function (instance) {
        try {
            if (typeof instance.CandidateAdded === 'function') {
                instance.CandidateAdded({}, { fromBlock: 'latest' }).watch(function(err, event) {
                    if(!err) App.renderData();
                });
            }
            if (typeof instance.ElectionStarted === 'function') {
                instance.ElectionStarted({}, { fromBlock: 'latest' }).watch(function(err, event) {
                    if(!err) App.renderData();
                });
            }
            if (typeof instance.ElectionEnded === 'function') {
                instance.ElectionEnded({}, { fromBlock: 'latest' }).watch(function(err, event) {
                    if(!err) App.renderData();
                });
            }
            if (typeof instance.VoteCast === 'function') {
                instance.VoteCast({}, { fromBlock: 'latest' }).watch(function(err, event) {
                    if(!err) App.renderData();
                });
            }
        } catch (e) {
            console.warn("Event subscription failed, falling back to manual refresh.", e);
        }
    },

    getNetworkName: function(id) {
        switch (id) {
            case "1": return "Ethereum Mainnet";
            case "11155111": return "Sepolia";
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
                App.account = account.toLowerCase();
                var shortAccount = account.substring(0,6) + '...' + account.substring(account.length-4);
                
                $("#infoWallet").text(account);
                $("#headerWallet").text(shortAccount);
                
                var btn = $("#connectWalletBtn");
                btn.html('<span class="indicator active"></span> ' + shortAccount);
                btn.addClass('connected');
                
                $("#infoStatusIndicator").addClass('active');
                $("#infoStatusText").text("Connected");
            } else {
                $("#headerWallet").text("Not Connected");
                $("#headerRole").text("Not Connected");
                $("#infoStatusIndicator").removeClass('active').addClass('error');
                $("#infoStatusText").text("Disconnected");
            }
        });

        web3.version.getNetwork(function(err, netId) {
            if (!err) {
                App.networkName = App.getNetworkName(netId);
                $("#headerNetwork").text(App.networkName);
                
                if (netId !== "11155111") {
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
        if (App.isDemoMode) return App.renderDemo();
        if (!App.contractInstance) {
            $("#loader").hide();
            $("#candidatesList").html('<div class="alert-box" style="margin-top: 20px;"><i data-lucide="alert-triangle" class="alert-icon"></i><div class="alert-content"><h4>Contract Not Found</h4><p>Unable to load the smart contract. Please ensure you are connected to the Sepolia network.</p></div></div>').show();
            lucide.createIcons();
            return;
        }
        var electionInstance = App.contractInstance;
        
        electionInstance.owner().then(function(ownerAddress) {
            App.owner = ownerAddress.toLowerCase();
            return electionInstance.electionState();
        }).then(function(state) {
            App.liveElectionStatusCode = state.toNumber();
            if (App.liveElectionStatusCode === 0) App.liveElectionStatusStr = 'NOT STARTED';
            else if (App.liveElectionStatusCode === 1) App.liveElectionStatusStr = 'ACTIVE';
            else if (App.liveElectionStatusCode === 2) App.liveElectionStatusStr = 'CLOSED';
            
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
            
            $("#statCandidates").text(App.candidatesCount);
            $("#statTotalVotes").text(App.totalVotes);
            $("#sidebarCandidates").text(App.candidatesCount);
            $("#sidebarTotalVotes").text(App.totalVotes);
            
            return electionInstance.voters(App.account);
        }).then(function (hasVoted) {
            App.hasVoted = hasVoted;
            
            var role = (App.account === App.owner) ? 'ADMIN' : 'VOTER';
            $("#headerRole").text(role);
            
            if (role === 'ADMIN') {
                $("#liveAdminControls").show();
                App.renderLiveAdminControls();
            } else {
                $("#liveAdminControls").hide();
            }
            
            if (App.liveElectionStatusStr === 'CLOSED') {
                $(".status-active").text("CLOSED").css("color", "var(--error)");
                $(".badge-success").html('<i data-lucide="x-circle" style="width: 12px; height: 12px; margin-right: 4px;"></i> CLOSED').css("background", "var(--error-bg)").css("color", "var(--error)");
            } else if (App.liveElectionStatusStr === 'ACTIVE') {
                $(".status-active").text("ACTIVE").css("color", "var(--success)");
                $(".badge-success").html('<i data-lucide="check-circle-2" style="width: 12px; height: 12px; margin-right: 4px;"></i> ACTIVE').css("background", "var(--success-bg)").css("color", "var(--success)");
            } else {
                $(".status-active").text("NOT STARTED").css("color", "var(--warning)");
                $(".badge-success").html('<i data-lucide="clock" style="width: 12px; height: 12px; margin-right: 4px;"></i> NOT STARTED').css("background", "var(--warning-bg)").css("color", "var(--warning)");
            }
            
            App.renderCandidates();
            App.renderResults();
            
            $("#loader").hide();
            $("#candidatesList").show();
            lucide.createIcons();
        }).catch(function (error) {
            console.warn(error);
        });
    },
    
    renderLiveAdminControls: function() {
        $("#liveAdminElectionStatus").text(App.liveElectionStatusStr);
        var btnGroup = $("#liveElectionBtnGroup");
        btnGroup.empty();
        
        if (App.liveElectionStatusCode === 0) { // NOT STARTED
            btnGroup.append('<button class="btn-success" onclick="App.liveStartElection()">Start Election</button>');
            $("#liveNewCandidateName").prop("disabled", false);
            $("#btnLiveAddCandidate").prop("disabled", false);
        } else if (App.liveElectionStatusCode === 1) { // ACTIVE
            btnGroup.append('<button class="btn-danger" onclick="App.liveEndElection()">End Election</button>');
            $("#liveNewCandidateName").prop("disabled", true);
            $("#btnLiveAddCandidate").prop("disabled", true);
        } else { // CLOSED
            btnGroup.append('<span>Election Closed. Voting disabled.</span>');
            $("#liveNewCandidateName").prop("disabled", true);
            $("#btnLiveAddCandidate").prop("disabled", true);
        }
    },
    
    liveAddCandidate: function() {
        var name = $("#liveNewCandidateName").val().trim();
        if (!name) return;
        App.showToast("Waiting for wallet confirmation...", "info");
        if (!App.contractInstance) return;
        App.contractInstance.addCandidate(name, { from: App.account }).then(function(result) {
            $("#liveNewCandidateName").val("");
            App.showToast("Candidate Added Successfully!<br><span class='toast-tx'>Tx: " + result.tx + "</span>", "success");
            App.renderData();
        }).catch(function(err) {
            console.error(err);
            App.showToast("Error adding candidate.", "error");
        });
    },

    liveStartElection: function() {
        App.showToast("Waiting for wallet confirmation...", "info");
        if (!App.contractInstance) return;
        App.contractInstance.startElection({ from: App.account }).then(function(result) {
            App.showToast("Election Started!<br><span class='toast-tx'>Tx: " + result.tx + "</span>", "success");
            App.renderData();
        }).catch(function(err) {
            console.error(err);
            App.showToast("Error starting election.", "error");
        });
    },

    liveEndElection: function() {
        App.showToast("Waiting for wallet confirmation...", "info");
        if (!App.contractInstance) return;
        App.contractInstance.endElection({ from: App.account }).then(function(result) {
            App.showToast("Election Ended!<br><span class='toast-tx'>Tx: " + result.tx + "</span>", "success");
            App.renderData();
        }).catch(function(err) {
            console.error(err);
            App.showToast("Error ending election.", "error");
        });
    },

    renderCandidates: function() {
        var container = $("#candidatesList");
        container.empty();
        
        var isLiveActive = (!App.isDemoMode && App.liveElectionStatusCode === 1);
        var isDemoActive = (App.isDemoMode && App.demoElectionStatus === 'ACTIVE');
        var isActive = App.isDemoMode ? isDemoActive : isLiveActive;
        
        App.candidates.forEach(function(c) {
            var percentage = App.totalVotes > 0 ? ((c.voteCount / App.totalVotes) * 100).toFixed(1) : 0;
            var numStr = (c.id < 10) ? '0' + c.id : c.id;
            
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
            
            var role = App.isDemoMode ? ($("#adminLayout").is(":visible") ? 'ADMIN' : 'VOTER') : (App.account === App.owner ? 'ADMIN' : 'VOTER');
            
            if (role !== 'ADMIN') {
                var btn = $('<button class="btn-primary">Cast Vote</button>');
                if (!isActive) {
                    btn.prop('disabled', true);
                    btn.text(App.isDemoMode ? 'Closed' : App.liveElectionStatusStr);
                } else if (App.hasVoted) {
                    btn.prop('disabled', true);
                    btn.text('Voted');
                } else {
                    btn.click(function() {
                        App.openConfirmModal(c.id, c.name);
                    });
                }
                right.append(btn);
            }
            
            row.append(left);
            row.append(center);
            row.append(right);
            
            container.append(row);
        });
    },
    
    renderResults: function() {
        var container = $("#resultsList");
        container.empty();
        
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
        
        if (App.liveElectionStatusCode !== 1) {
            App.showToast("Election is not active.", "error");
            return;
        }
        
        App.showToast("Waiting for wallet confirmation...", "info");
        
        if (!App.contractInstance) return;
        App.contractInstance.vote(candidateId, { from: App.account }).then(function (result) {
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
                App.showToast("Vote already recorded or invalid state. Transaction reverted.", "error");
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
