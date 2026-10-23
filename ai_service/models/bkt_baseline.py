"""
Bayesian Knowledge Tracing (BKT) Baseline Implementation
Reference: Corbett & Anderson (1995)
Topic: Student Mastery Estimation
"""

class BayesianKnowledgeTracing:
    def __init__(self, p_l0=0.1, p_t=0.2, p_g=0.25, p_s=0.1):
        """
        4 Pedagogical Parameters of BKT:
        - p_l0: Prior probability of knowing the skill initially
        - p_t : Transition probability (learning step)
        - p_g : Guess probability (lucky guess on multiple choice)
        - p_s : Slip probability (careless mistake despite knowing skill)
        """
        self.p_l0 = p_l0
        self.p_t = p_t
        self.p_g = p_g
        self.p_s = p_s

    def update(self, p_l_prev, is_correct):
        """
        Bayesian inference step:
        P(L_t | obs) and P(L_{t+1})
        """
        if is_correct:
            # Observation = Correct (a_t = 1)
            num = p_l_prev * (1.0 - self.p_s)
            den = num + (1.0 - p_l_prev) * self.p_g
        else:
            # Observation = Incorrect (a_t = 0)
            num = p_l_prev * self.p_s
            den = num + (1.0 - p_l_prev) * (1.0 - self.p_g)

        p_l_given_obs = num / den if den != 0 else p_l_prev
        # Transition step: Learning transition to next opportunity
        p_l_next = p_l_given_obs + (1.0 - p_l_given_obs) * self.p_t
        return p_l_next

    def predict_sequence(self, sequence_correctness):
        """
        Calculates mastery progression through an interaction sequence.
        sequence_correctness: list of bools or integers [1, 0, 1, 1]
        """
        p_l = self.p_l0
        trajectory = [p_l]
        for correct in sequence_correctness:
            p_l = self.update(p_l, bool(correct))
            trajectory.append(p_l)
        return trajectory

if __name__ == "__main__":
    bkt = BayesianKnowledgeTracing(p_l0=0.2, p_t=0.15, p_g=0.25, p_s=0.1)
    # Simulated sequence: Sai -> Đúng -> Đúng -> Đúng
    sample_answers = [0, 1, 1, 1]
    res = bkt.predict_sequence(sample_answers)
    print("BKT Mastery Level Progression:")
    for step, mastery in enumerate(res):
        print(f"  Step {step}: Estimated Mastery = {mastery:.4f} ({mastery*100:.1f}%)")
